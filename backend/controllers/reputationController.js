const ReputationEvent = require('../models/ReputationEvent');
const User = require('../models/User');

// GET /api/reputation
const getReputation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('reputationScore');
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

// GET /api/reputation/history
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const events = await ReputationEvent.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await ReputationEvent.countDocuments({ userId: req.user._id });
    res.json({ success: true, data: events, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

module.exports = { getReputation, getHistory };
