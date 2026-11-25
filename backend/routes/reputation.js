const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getReputation, getHistory } = require('../controllers/reputationController');

router.get('/', authenticate, getReputation);
router.get('/history', authenticate, getHistory);

module.exports = router;
