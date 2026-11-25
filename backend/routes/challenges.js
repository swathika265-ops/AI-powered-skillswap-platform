const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getChallenges, createChallenge, joinChallenge, updateSubmission, getMySubmissions, reviewSubmission } = require('../controllers/challengeController');

router.get('/', authenticate, getChallenges);
router.post('/', authenticate, authorize('admin'), createChallenge);
router.post('/:id/join', authenticate, joinChallenge);
router.get('/submissions/my', authenticate, getMySubmissions);
router.patch('/submissions/:id', authenticate, updateSubmission);
router.patch('/submissions/:id/review', authenticate, authorize('admin'), reviewSubmission);

module.exports = router;
