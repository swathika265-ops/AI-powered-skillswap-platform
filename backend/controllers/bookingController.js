const Booking = require('../models/Booking');
const UserSkill = require('../models/UserSkill');
const User = require('../models/User');
const MentorAvailability = require('../models/MentorAvailability');
const CreditTransaction = require('../models/CreditTransaction');
const ReputationEvent = require('../models/ReputationEvent');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');

// Helper: validate meeting URL
const validMeetingDomains = ['meet.google.com', 'zoom.us', 'teams.microsoft.com', 'teams.live.com'];
const isValidMeetingUrl = (url) => {
  try {
    const parsed = new URL(url);
    return validMeetingDomains.some(d => parsed.hostname.includes(d));
  } catch { return false; }
};

// GET /api/availability
const getAvailability = async (req, res, next) => {
  try {
    const mentorId = req.query.mentorId || req.user._id;
    const slots = await MentorAvailability.find({ mentorId, isActive: true });
    res.json({ success: true, data: slots });
  } catch (error) { next(error); }
};

// POST /api/availability
const setAvailability = async (req, res, next) => {
  try {
    const { slots } = req.body; // array of { dayOfWeek, startTime, endTime, timezone }
    await MentorAvailability.deleteMany({ mentorId: req.user._id, isRecurring: true });
    const created = [];
    for (const s of slots) {
      const slot = await MentorAvailability.create({ mentorId: req.user._id, ...s });
      created.push(slot);
    }
    res.json({ success: true, data: created });
  } catch (error) { next(error); }
};

// POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { mentorId, skillId, scheduledAt, duration, notes } = req.body;
    const learnerId = req.user._id;

    if (learnerId.toString() === mentorId) return res.status(400).json({ success: false, error: 'Cannot book yourself' });

    // Verify mentor has verified skill
    const mentorSkill = await UserSkill.findOne({ userId: mentorId, skillId, type: 'teaching', status: 'verified' });
    if (!mentorSkill) return res.status(403).json({ success: false, error: 'Mentor is not verified to teach this skill' });

    // Check learner credits
    const creditAmount = duration / 60;
    const learner = await User.findById(learnerId);
    if (learner.creditBalance < creditAmount) return res.status(400).json({ success: false, error: 'Insufficient credits' });

    // Check overlap
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + duration * 60000);
    const overlap = await Booking.findOne({
      mentorId, status: { $in: ['pending', 'confirmed'] },
      scheduledAt: { $lt: endTime },
      $expr: { $gt: [{ $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] }, startTime] },
    });
    if (overlap) return res.status(409).json({ success: false, error: 'Time slot overlaps with existing booking' });

    const booking = await Booking.create({ learnerId, mentorId, skillId, scheduledAt: startTime, duration, creditAmount, notes });

    await Notification.create({ userId: mentorId, type: 'booking_request', title: 'New Booking Request', message: `${learner.name} wants to book a ${duration}-minute session.`, referenceId: booking._id, referenceModel: 'Booking' });

    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

// PATCH /api/bookings/:id/confirm
const confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.mentorId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Only mentor can confirm' });
    if (booking.status !== 'pending') return res.status(400).json({ success: false, error: 'Can only confirm pending bookings' });

    booking.status = 'confirmed';
    await booking.save();

    await Notification.create({ userId: booking.learnerId, type: 'booking_confirmed', title: 'Booking Confirmed', message: `Your session has been confirmed for ${booking.scheduledAt.toISOString()}.`, referenceId: booking._id, referenceModel: 'Booking' });

    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
};

// PATCH /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (![booking.learnerId.toString(), booking.mentorId.toString()].includes(req.user._id.toString())) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    if (!['pending', 'confirmed'].includes(booking.status)) return res.status(400).json({ success: false, error: 'Cannot cancel' });

    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id;
    booking.cancelReason = req.body.reason || '';
    await booking.save();

    const otherId = req.user._id.toString() === booking.learnerId.toString() ? booking.mentorId : booking.learnerId;
    await Notification.create({ userId: otherId, type: 'booking_cancelled', title: 'Booking Cancelled', message: `A session has been cancelled.`, referenceId: booking._id, referenceModel: 'Booking' });

    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
};

// PATCH /api/bookings/:id/complete
const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.mentorId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Only mentor can complete' });
    if (booking.status !== 'confirmed') return res.status(400).json({ success: false, error: 'Can only complete confirmed bookings' });

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    // Process credits atomically with idempotency key
    const key = `booking_${booking._id}_complete`;
    const existing = await CreditTransaction.findOne({ idempotencyKey: key + '_learner' });
    if (!existing) {
      // Deduct from learner
      const learner = await User.findById(booking.learnerId);
      learner.creditBalance = Math.max(0, learner.creditBalance - booking.creditAmount);
      learner.totalCreditsSpent += booking.creditAmount;
      learner.completedSessions += 1;
      await learner.save();
      await CreditTransaction.create({ userId: booking.learnerId, amount: -booking.creditAmount, type: 'spent', reason: 'Session completed', bookingId: booking._id, balanceAfter: learner.creditBalance, idempotencyKey: key + '_learner' });

      // Credit to mentor
      const mentor = await User.findById(booking.mentorId);
      mentor.creditBalance += booking.creditAmount;
      mentor.totalCreditsEarned += booking.creditAmount;
      mentor.completedSessions += 1;
      await mentor.save();
      await CreditTransaction.create({ userId: booking.mentorId, amount: booking.creditAmount, type: 'earned', reason: 'Session completed', bookingId: booking._id, balanceAfter: mentor.creditBalance, idempotencyKey: key + '_mentor' });

      // Reputation events
      const addReputation = async (userId, change, category) => {
        const user = await User.findById(userId);
        const scoreBefore = user.reputationScore;
        user.reputationScore = Math.min(100, Math.max(0, scoreBefore + change));
        await user.save();
        await ReputationEvent.create({ userId, change, reason: 'Session completed', category, referenceId: booking._id, referenceModel: 'Booking', scoreBefore, scoreAfter: user.reputationScore });
      };
      await addReputation(booking.learnerId, 2, 'session_completed');
      await addReputation(booking.mentorId, 3, 'session_completed');

      // Notifications
      await Notification.create({ userId: booking.learnerId, type: 'booking_completed', title: 'Session Completed', message: `Your session has been marked as completed. ${booking.creditAmount} credits deducted.`, referenceId: booking._id, referenceModel: 'Booking' });
      await Notification.create({ userId: booking.mentorId, type: 'credit_earned', title: 'Credits Earned', message: `You earned ${booking.creditAmount} credits for the completed session.`, referenceId: booking._id, referenceModel: 'Booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
};

// PATCH /api/bookings/:id/meeting-link
const addMeetingLink = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.mentorId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, error: 'Only mentor can add meeting link' });

    const { meetingUrl } = req.body;
    if (!meetingUrl || !isValidMeetingUrl(meetingUrl)) {
      return res.status(400).json({ success: false, error: 'Invalid meeting URL. Supported: Google Meet, Zoom, Microsoft Teams' });
    }

    const parsed = new URL(meetingUrl);
    let provider = 'other';
    if (parsed.hostname.includes('meet.google.com')) provider = 'google_meet';
    else if (parsed.hostname.includes('zoom.us')) provider = 'zoom';
    else if (parsed.hostname.includes('teams.microsoft.com') || parsed.hostname.includes('teams.live.com')) provider = 'teams';

    booking.meetingUrl = meetingUrl;
    booking.meetingProvider = provider;
    await booking.save();

    await Notification.create({ userId: booking.learnerId, type: 'meeting_link', title: 'Meeting Link Added', message: 'Your mentor has added a meeting link for the session.', referenceId: booking._id, referenceModel: 'Booking' });

    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
};

// GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const query = {};
    if (role === 'mentor') query.mentorId = req.user._id;
    else if (role === 'learner') query.learnerId = req.user._id;
    else query.$or = [{ learnerId: req.user._id }, { mentorId: req.user._id }];
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('learnerId', 'name profileImage email')
      .populate('mentorId', 'name profileImage email')
      .populate('skillId', 'name category')
      .sort({ scheduledAt: -1 });

    // Hide meeting URL from non-participants
    const safe = bookings.map(b => {
      const obj = b.toObject();
      const isParticipant = [obj.learnerId?._id?.toString(), obj.mentorId?._id?.toString()].includes(req.user._id.toString());
      if (!isParticipant) { obj.meetingUrl = ''; }
      return obj;
    });

    res.json({ success: true, data: safe });
  } catch (error) { next(error); }
};

// GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('learnerId', 'name profileImage email').populate('mentorId', 'name profileImage email').populate('skillId', 'name category');
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });

    const isParticipant = [booking.learnerId?._id?.toString(), booking.mentorId?._id?.toString()].includes(req.user._id.toString());
    if (!isParticipant && req.user.role !== 'admin') return res.status(403).json({ success: false, error: 'Not authorized' });

    const obj = booking.toObject();
    if (!isParticipant) obj.meetingUrl = '';

    res.json({ success: true, data: obj });
  } catch (error) { next(error); }
};

module.exports = { getAvailability, setAvailability, createBooking, confirmBooking, cancelBooking, completeBooking, addMeetingLink, getBookings, getBookingById };
