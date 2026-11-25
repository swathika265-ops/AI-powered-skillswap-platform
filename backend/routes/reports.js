const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getReports, createReport, resolveReport } = require('../controllers/adminController');

router.get('/', authenticate, authorize('admin'), getReports);
router.post('/', authenticate, createReport);
router.patch('/:id/resolve', authenticate, authorize('admin'), resolveReport);

module.exports = router;
