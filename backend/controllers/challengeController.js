const { Challenge, ChallengeSubmission } = require('../models/Challenge');
const Notification = require('../models/Notification');

// GET /api/challenges
const getChallenges = async (req, res, next) => {
  try {
    const { difficulty, skillId } = req.query;
    const query = { isActive: true };
    if (difficulty) query.difficulty = difficulty;
    if (skillId) query.skillId = skillId;
    const challenges = await Challenge.find(query).populate('skillId', 'name category').populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: challenges });
  } catch (error) { next(error); }
};

// POST /api/challenges (admin)
const createChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: challenge });
  } catch (error) { next(error); }
};

// POST /api/challenges/:id/join
const joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge || !challenge.isActive) return res.status(404).json({ success: false, error: 'Challenge not found' });
    if (challenge.deadline && new Date() > challenge.deadline) return res.status(400).json({ success: false, error: 'Challenge deadline has passed' });

    const existing = await ChallengeSubmission.findOne({ challengeId: challenge._id, userId: req.user._id });
    if (existing) return res.status(409).json({ success: false, error: 'Already joined' });

    const submission = await ChallengeSubmission.create({ challengeId: challenge._id, userId: req.user._id });
    challenge.participantCount += 1;
    await challenge.save();
    res.status(201).json({ success: true, data: submission });
  } catch (error) { next(error); }
};

// PATCH /api/submissions/:id
const updateSubmission = async (req, res, next) => {
  try {
    const sub = await ChallengeSubmission.findOne({ _id: req.params.id, userId: req.user._id });
    if (!sub) return res.status(404).json({ success: false, error: 'Submission not found' });
    const { projectUrl, description, fileUrl } = req.body;
    if (projectUrl) sub.projectUrl = projectUrl;
    if (description) sub.description = description;
    if (fileUrl) sub.fileUrl = fileUrl;
    sub.status = 'submitted';
    await sub.save();
    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
};

// GET /api/submissions/my
const getMySubmissions = async (req, res, next) => {
  try {
    const subs = await ChallengeSubmission.find({ userId: req.user._id }).populate('challengeId').sort({ createdAt: -1 });
    res.json({ success: true, data: subs });
  } catch (error) { next(error); }
};

// PATCH /api/submissions/:id/review (admin)
const reviewSubmission = async (req, res, next) => {
  try {
    const sub = await ChallengeSubmission.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, error: 'Submission not found' });
    const { status, feedback } = req.body;
    sub.status = status;
    sub.feedback = feedback || '';
    sub.reviewedBy = req.user._id;
    sub.reviewedAt = new Date();
    await sub.save();

    await Notification.create({ userId: sub.userId, type: 'admin_action', title: 'Submission Reviewed', message: `Your challenge submission has been ${status}.`, referenceId: sub._id, referenceModel: 'ChallengeSubmission' });

    res.json({ success: true, data: sub });
  } catch (error) { next(error); }
};

module.exports = { getChallenges, createChallenge, joinChallenge, updateSubmission, getMySubmissions, reviewSubmission };
