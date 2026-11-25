const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { findMatches } = require('../controllers/matchingController');

router.post('/find', authenticate, findMatches);

module.exports = router;
