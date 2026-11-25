const AssessmentQuestion = require('../models/AssessmentQuestion');
const AssessmentAttempt = require('../models/AssessmentAttempt');
const AssessmentEvent = require('../models/AssessmentEvent');
const UserSkill = require('../models/UserSkill');
const SkillProof = require('../models/SkillProof');
const Notification = require('../models/Notification');
const PlatformSettings = require('../models/PlatformSettings');

const getSetting = async (key, defaultVal) => {
  const s = await PlatformSettings.findOne({ key });
  return s ? s.value : defaultVal;
};

// POST /api/assessments/start
const startAssessment = async (req, res, next) => {
  try {
    const { skillId, userSkillId } = req.body;
    const userSkill = await UserSkill.findOne({ _id: userSkillId, userId: req.user._id, skillId, type: 'teaching' });
    if (!userSkill) return res.status(404).json({ success: false, error: 'Teaching skill not found' });

    // ENFORCE: must have at least 2 approved distinct proofs
    const approvedProofs = await SkillProof.find({ userId: req.user._id, skillId, status: 'approved' });
    const distinctTypes = new Set(approvedProofs.map(p => p.proofType));
    if (distinctTypes.size < 2) {
      return res.status(403).json({ success: false, error: 'You need at least 2 approved proofs with distinct types before taking the assessment' });
    }

    if (userSkill.status === 'verified') return res.status(400).json({ success: false, error: 'Skill already verified' });

    // Check attempt limits and cooldown
    const maxAttempts = await getSetting('assessment_max_attempts', 3);
    const cooldownHours = await getSetting('assessment_cooldown_hours', 24);
    const previousAttempts = await AssessmentAttempt.find({ userId: req.user._id, skillId }).sort({ createdAt: -1 });

    if (previousAttempts.length >= maxAttempts) {
      return res.status(403).json({ success: false, error: `Maximum ${maxAttempts} attempts reached for this skill` });
    }

    // Check cooldown
    if (previousAttempts.length > 0) {
      const lastAttempt = previousAttempts[0];
      const cooldownEnd = new Date(lastAttempt.createdAt.getTime() + cooldownHours * 3600000);
      if (new Date() < cooldownEnd) {
        return res.status(403).json({ success: false, error: `Please wait until ${cooldownEnd.toISOString()} before retrying` });
      }
    }

    // Check for in-progress attempt
    const inProgress = await AssessmentAttempt.findOne({ userId: req.user._id, skillId, status: 'in_progress' });
    if (inProgress) return res.status(400).json({ success: false, error: 'You have an assessment in progress', data: { attemptId: inProgress._id } });

    // Get questions
    const questions = await AssessmentQuestion.find({ skillId, isActive: true });
    if (questions.length === 0) return res.status(400).json({ success: false, error: 'No assessment questions available for this skill' });

    // Shuffle and pick questions (max 20)
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 20);
    const totalMarks = shuffled.reduce((sum, q) => sum + q.marks, 0);
    const passThreshold = await getSetting('assessment_pass_percentage', 70);
    const maxViolations = await getSetting('assessment_max_violations', 3);

    const attempt = await AssessmentAttempt.create({
      userId: req.user._id, skillId, userSkillId,
      questions: shuffled.map(q => ({ questionId: q._id, selectedAnswer: -1, isCorrect: false, marks: 0 })),
      totalQuestions: shuffled.length, totalMarks, passThreshold, maxViolations, duration: 30,
    });

    // Update skill status
    userSkill.status = 'assessment_in_progress';
    await userSkill.save();

    // Log event
    await AssessmentEvent.create({ attemptId: attempt._id, userId: req.user._id, eventType: 'started' });

    // Return questions WITHOUT correct answers
    const safeQuestions = shuffled.map(q => ({
      _id: q._id, question: q.question, options: q.options, marks: q.marks, difficulty: q.difficulty,
    }));

    res.status(201).json({
      success: true,
      data: { attemptId: attempt._id, questions: safeQuestions, duration: attempt.duration, totalMarks, maxViolations, passThreshold },
    });
  } catch (error) { next(error); }
};

// POST /api/assessments/:attemptId/answer
const submitAnswer = async (req, res, next) => {
  try {
    const attempt = await AssessmentAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id, status: 'in_progress' });
    if (!attempt) return res.status(404).json({ success: false, error: 'Active assessment not found' });

    const { questionId, selectedAnswer } = req.body;
    const qIndex = attempt.questions.findIndex(q => q.questionId.toString() === questionId);
    if (qIndex === -1) return res.status(400).json({ success: false, error: 'Question not in this assessment' });

    attempt.questions[qIndex].selectedAnswer = selectedAnswer;
    await attempt.save();
    res.json({ success: true, message: 'Answer saved' });
  } catch (error) { next(error); }
};

// POST /api/assessments/:attemptId/violation
const recordViolation = async (req, res, next) => {
  try {
    const attempt = await AssessmentAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id, status: 'in_progress' });
    if (!attempt) return res.status(404).json({ success: false, error: 'Active assessment not found' });

    const { eventType, details } = req.body;
    attempt.violations += 1;
    await AssessmentEvent.create({ attemptId: attempt._id, userId: req.user._id, eventType: eventType || 'tab_switch', details });

    if (attempt.violations >= attempt.maxViolations) {
      // Auto-fail
      attempt.status = 'auto_failed';
      attempt.completedAt = new Date();
      attempt.passed = false;
      await attempt.save();

      const userSkill = await UserSkill.findById(attempt.userSkillId);
      if (userSkill) { userSkill.status = 'assessment_pending'; await userSkill.save(); }

      await AssessmentEvent.create({ attemptId: attempt._id, userId: req.user._id, eventType: 'auto_failed', details: { violations: attempt.violations } });

      return res.json({ success: true, autoFailed: true, violations: attempt.violations, message: 'Assessment auto-failed due to violations' });
    }

    await attempt.save();
    res.json({ success: true, violations: attempt.violations, maxViolations: attempt.maxViolations, remaining: attempt.maxViolations - attempt.violations });
  } catch (error) { next(error); }
};

// POST /api/assessments/:attemptId/submit
const submitAssessment = async (req, res, next) => {
  try {
    const attempt = await AssessmentAttempt.findOne({ _id: req.params.attemptId, userId: req.user._id, status: 'in_progress' });
    if (!attempt) return res.status(404).json({ success: false, error: 'Active assessment not found' });

    // Grade on the backend
    let obtainedMarks = 0;
    for (const q of attempt.questions) {
      const question = await AssessmentQuestion.findById(q.questionId);
      if (question && q.selectedAnswer === question.correctAnswer) {
        q.isCorrect = true;
        q.marks = question.marks;
        obtainedMarks += question.marks;
      } else {
        q.isCorrect = false;
        q.marks = 0;
      }
    }

    const percentage = attempt.totalMarks > 0 ? Math.round((obtainedMarks / attempt.totalMarks) * 100) : 0;
    const passed = percentage >= attempt.passThreshold;

    attempt.obtainedMarks = obtainedMarks;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.timeSpent = Math.floor((new Date() - attempt.startedAt) / 1000);
    await attempt.save();

    // Update skill status
    const userSkill = await UserSkill.findById(attempt.userSkillId);
    if (userSkill) {
      if (passed) {
        userSkill.status = 'verified';
        userSkill.verifiedAt = new Date();
      } else {
        userSkill.status = 'assessment_pending';
      }
      await userSkill.save();
    }

    await AssessmentEvent.create({ attemptId: attempt._id, userId: req.user._id, eventType: 'completed', details: { percentage, passed } });

    await Notification.create({
      userId: req.user._id, type: 'assessment_result',
      title: passed ? 'Assessment Passed!' : 'Assessment Not Passed',
      message: passed ? `You scored ${percentage}% and can now teach this skill!` : `You scored ${percentage}%. Required: ${attempt.passThreshold}%.`,
      referenceId: attempt._id, referenceModel: 'AssessmentAttempt',
    });

    res.json({
      success: true,
      data: {
        attemptId: attempt._id, obtainedMarks, totalMarks: attempt.totalMarks,
        percentage, passThreshold: attempt.passThreshold, passed, violations: attempt.violations, timeSpent: attempt.timeSpent,
      },
    });
  } catch (error) { next(error); }
};

// GET /api/assessments/history/:skillId
const getAssessmentHistory = async (req, res, next) => {
  try {
    const attempts = await AssessmentAttempt.find({ userId: req.user._id, skillId: req.params.skillId })
      .select('-questions').sort({ createdAt: -1 });
    res.json({ success: true, data: attempts });
  } catch (error) { next(error); }
};

// POST /api/assessments/questions (admin)
const createQuestion = async (req, res, next) => {
  try {
    const { skillId, question, options, correctAnswer, marks, difficulty, explanation } = req.body;
    if (!options || options.length < 2) return res.status(400).json({ success: false, error: 'At least 2 options required' });
    if (correctAnswer < 0 || correctAnswer >= options.length) return res.status(400).json({ success: false, error: 'Invalid correct answer index' });

    const q = await AssessmentQuestion.create({ skillId, question, options, correctAnswer, marks: marks || 1, difficulty, explanation, createdBy: req.user._id });
    res.status(201).json({ success: true, data: q });
  } catch (error) { next(error); }
};

// GET /api/assessments/questions/:skillId (admin)
const getQuestions = async (req, res, next) => {
  try {
    const questions = await AssessmentQuestion.find({ skillId: req.params.skillId }).sort({ createdAt: -1 });
    res.json({ success: true, data: questions });
  } catch (error) { next(error); }
};

// DELETE /api/assessments/questions/:id (admin)
const deleteQuestion = async (req, res, next) => {
  try {
    await AssessmentQuestion.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Question deactivated' });
  } catch (error) { next(error); }
};

module.exports = { startAssessment, submitAnswer, recordViolation, submitAssessment, getAssessmentHistory, createQuestion, getQuestions, deleteQuestion };
