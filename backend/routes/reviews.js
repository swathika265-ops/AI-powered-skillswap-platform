const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createReview, getUserReviews } = require('../controllers/reviewController');

router.post('/', authenticate, createReview);
router.get('/user/:userId', getUserReviews);

module.exports = router;
