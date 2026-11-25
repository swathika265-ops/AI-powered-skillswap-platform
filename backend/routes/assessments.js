const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const c = require('../controllers/assessmentController');

router.post('/start', authenticate, c.startAssessment);
router.post('/:attemptId/answer', authenticate, c.submitAnswer);
router.post('/:attemptId/violation', authenticate, c.recordViolation);
router.post('/:attemptId/submit', authenticate, c.submitAssessment);
router.get('/history/:skillId', authenticate, c.getAssessmentHistory);
router.post('/questions', authenticate, authorize('admin'), c.createQuestion);
router.get('/questions/:skillId', authenticate, authorize('admin'), c.getQuestions);
router.delete('/questions/:id', authenticate, authorize('admin'), c.deleteQuestion);

module.exports = router;
