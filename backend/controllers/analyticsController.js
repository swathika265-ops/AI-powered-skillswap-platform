const User = require('../models/User');
const Booking = require('../models/Booking');
const UserSkill = require('../models/UserSkill');
const CreditTransaction = require('../models/CreditTransaction');
const Review = require('../models/Review');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const LearningRoadmap = require('../models/LearningRoadmap');
const { ChallengeSubmission } = require('../models/Challenge');

// GET /api/analytics/user
const getUserAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('creditBalance totalCreditsEarned totalCreditsSpent reputationScore completedSessions averageRating totalRatings');
    const teachingBookings = await Booking.countDocuments({ mentorId: userId, status: 'completed' });
    const learningBookings = await Booking.countDocuments({ learnerId: userId, status: 'completed' });
    const upcomingBookings = await Booking.countDocuments({ $or: [{ learnerId: userId }, { mentorId: userId }], status: 'confirmed', scheduledAt: { $gte: new Date() } });
    const roadmaps = await LearningRoadmap.find({ userId, isActive: true }).select('overallProgress');
    const challengesCompleted = await ChallengeSubmission.countDocuments({ userId, status: 'approved' });

    res.json({
      success: true, data: {
        ...user.toObject(), teachingHours: teachingBookings, learningHours: learningBookings,
        upcomingBookings, roadmapProgress: roadmaps, challengesCompleted,
      },
    });
  } catch (error) { next(error); }
};

// GET /api/analytics/mentor
const getMentorAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const verifiedSkills = await UserSkill.countDocuments({ userId, type: 'teaching', status: 'verified' });
    const totalBookings = await Booking.countDocuments({ mentorId: userId });
    const completedBookings = await Booking.countDocuments({ mentorId: userId, status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ mentorId: userId, status: 'cancelled' });
    const reviews = await Review.find({ revieweeId: userId, isVisible: true }).select('rating');
    const earned = await CreditTransaction.find({ userId, type: 'earned' }).select('amount');

    res.json({
      success: true, data: {
        verifiedSkills, totalBookings, completedBookings, cancelledBookings,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0,
        totalEarned: earned.reduce((s, t) => s + t.amount, 0),
        averageRating: reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10 : 0,
        totalReviews: reviews.length,
      },
    });
  } catch (error) { next(error); }
};

// GET /api/analytics/admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const roleBreakdown = { learners: await User.countDocuments({ role: 'learner' }), mentors: await User.countDocuments({ role: 'mentor' }), admins: await User.countDocuments({ role: 'admin' }) };
    const verifiedSkills = await UserSkill.countDocuments({ status: 'verified' });
    const pendingProofs = await require('../models/SkillProof').countDocuments({ status: 'pending' });
    const assessments = await AssessmentAttempt.countDocuments();
    const passedAssessments = await AssessmentAttempt.countDocuments({ passed: true });
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const totalCredits = await CreditTransaction.countDocuments();
    const openReports = await require('../models/Report').countDocuments({ status: 'open' });

    res.json({
      success: true, data: {
        totalUsers, activeUsers, roleBreakdown, verifiedSkills, pendingProofs,
        assessments: { total: assessments, passed: passedAssessments, passRate: assessments > 0 ? Math.round((passedAssessments / assessments) * 100) : 0 },
        bookings: { total: totalBookings, completed: completedBookings, cancelled: cancelledBookings },
        totalCreditTransactions: totalCredits, openReports,
      },
    });
  } catch (error) { next(error); }
};

module.exports = { getUserAnalytics, getMentorAnalytics, getAdminAnalytics };
