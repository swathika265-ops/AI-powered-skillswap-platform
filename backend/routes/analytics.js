const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getUserAnalytics, getMentorAnalytics, getAdminAnalytics } = require('../controllers/analyticsController');

router.get('/user', authenticate, getUserAnalytics);
router.get('/mentor', authenticate, getMentorAnalytics);
router.get('/admin', authenticate, authorize('admin'), getAdminAnalytics);

module.exports = router;
