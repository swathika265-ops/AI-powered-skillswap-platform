const Review = require('../models/Review');
const Booking = require('../models/Booking');
const User = require('../models/User');
const ReputationEvent = require('../models/ReputationEvent');
const Notification = require('../models/Notification');

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ success: false, error: 'Can only review completed sessions' });

    const isParticipant = [booking.learnerId.toString(), booking.mentorId.toString()].includes(req.user._id.toString());
    if (!isParticipant) return res.status(403).json({ success: false, error: 'Not a participant' });

    // Determine reviewee (the other person)
    const revieweeId = req.user._id.toString() === booking.learnerId.toString() ? booking.mentorId : booking.learnerId;

    // Prevent self-review
    if (revieweeId.toString() === req.user._id.toString()) return res.status(400).json({ success: false, error: 'Cannot review yourself' });

    // Check duplicate
    const existing = await Review.findOne({ bookingId, reviewerId: req.user._id });
    if (existing) return res.status(409).json({ success: false, error: 'Already reviewed this session' });

    const review = await Review.create({ bookingId, reviewerId: req.user._id, revieweeId, skillId: booking.skillId, rating, comment });

    // Update reviewee average rating
    const allReviews = await Review.find({ revieweeId, isVisible: true });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(revieweeId, { averageRating: Math.round(avgRating * 10) / 10, totalRatings: allReviews.length });

    // Reputation impact
    const repChange = rating >= 4 ? 2 : rating >= 3 ? 0 : -2;
    if (repChange !== 0) {
      const reviewee = await User.findById(revieweeId);
      const scoreBefore = reviewee.reputationScore;
      reviewee.reputationScore = Math.min(100, Math.max(0, scoreBefore + repChange));
      await reviewee.save();
      await ReputationEvent.create({ userId: revieweeId, change: repChange, reason: `Received ${rating}-star review`, category: 'rating_received', referenceId: review._id, referenceModel: 'Review', scoreBefore, scoreAfter: reviewee.reputationScore });
    }

    await Notification.create({ userId: revieweeId, type: 'new_review', title: 'New Review', message: `You received a ${rating}-star review.`, referenceId: review._id, referenceModel: 'Review' });

    res.status(201).json({ success: true, data: review });
  } catch (error) { next(error); }
};

// GET /api/reviews/user/:userId
const getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId, isVisible: true })
      .populate('reviewerId', 'name profileImage').populate('skillId', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) { next(error); }
};

module.exports = { createReview, getUserReviews };
