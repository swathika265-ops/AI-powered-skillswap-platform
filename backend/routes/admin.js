const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getSettings, updateSetting, getAuditLogs } = require('../controllers/adminController');

router.get('/settings', authenticate, authorize('admin'), getSettings);
router.put('/settings/:key', authenticate, authorize('admin'), updateSetting);
router.get('/audit-logs', authenticate, authorize('admin'), getAuditLogs);

module.exports = router;
