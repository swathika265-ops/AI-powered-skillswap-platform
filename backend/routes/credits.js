const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getBalance, getHistory } = require('../controllers/creditController');

router.get('/balance', authenticate, getBalance);
router.get('/history', authenticate, getHistory);

module.exports = router;
