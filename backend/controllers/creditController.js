const CreditTransaction = require('../models/CreditTransaction');
const User = require('../models/User');

// GET /api/credits/balance
const getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('creditBalance totalCreditsEarned totalCreditsSpent');
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

// GET /api/credits/history
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const transactions = await CreditTransaction.find({ userId: req.user._id })
      .populate('bookingId', 'scheduledAt duration').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await CreditTransaction.countDocuments({ userId: req.user._id });
    res.json({ success: true, data: transactions, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
};

module.exports = { getBalance, getHistory };
