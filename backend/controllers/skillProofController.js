const SkillProof = require('../models/SkillProof');
const UserSkill = require('../models/UserSkill');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// POST /api/skill-proofs
const submitProof = async (req, res, next) => {
  try {
    const { skillId, userSkillId, proofType, title, description, externalUrl } = req.body;
    const userSkill = await UserSkill.findOne({ _id: userSkillId, userId: req.user._id, type: 'teaching' });
    if (!userSkill) return res.status(404).json({ success: false, error: 'Teaching skill not found' });

    // Check how many proofs already exist for this skill
    const existingProofs = await SkillProof.find({ userId: req.user._id, skillId });
    const approvedProofs = existingProofs.filter(p => p.status === 'approved');
    
    // Check for duplicate proof types among approved proofs
    const existingTypes = approvedProofs.map(p => p.proofType);
    if (existingTypes.includes(proofType) && approvedProofs.length >= 2) {
      return res.status(400).json({ success: false, error: 'You already have 2 approved proofs with distinct types' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const proof = await SkillProof.create({
      userId: req.user._id, skillId, userSkillId, proofType, title, description, fileUrl, externalUrl: externalUrl || '',
    });

    // Update user skill status
    if (userSkill.status === 'proofs_rejected') {
      userSkill.status = 'proofs_pending';
      await userSkill.save();
    }

    res.status(201).json({ success: true, data: proof });
  } catch (error) { next(error); }
};

// GET /api/skill-proofs/my-proofs
const getMyProofs = async (req, res, next) => {
  try {
    const proofs = await SkillProof.find({ userId: req.user._id }).populate('skillId').sort({ createdAt: -1 });
    res.json({ success: true, data: proofs });
  } catch (error) { next(error); }
};

// GET /api/skill-proofs/pending (admin)
const getPendingProofs = async (req, res, next) => {
  try {
    const proofs = await SkillProof.find({ status: 'pending' })
      .populate('userId', 'name email').populate('skillId', 'name category').sort({ createdAt: 1 });
    res.json({ success: true, data: proofs });
  } catch (error) { next(error); }
};

// PATCH /api/skill-proofs/:id/review (admin)
const reviewProof = async (req, res, next) => {
  try {
    const { status, reviewNotes } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be approved or rejected' });
    }

    const proof = await SkillProof.findById(req.params.id);
    if (!proof) return res.status(404).json({ success: false, error: 'Proof not found' });
    if (proof.status !== 'pending') return res.status(400).json({ success: false, error: 'Proof already reviewed' });

    proof.status = status;
    proof.reviewedBy = req.user._id;
    proof.reviewedAt = new Date();
    proof.reviewNotes = reviewNotes || '';
    await proof.save();

    // Count approved proofs with distinct types for this skill
    const allProofs = await SkillProof.find({ userId: proof.userId, skillId: proof.skillId, status: 'approved' });
    const distinctTypes = new Set(allProofs.map(p => p.proofType));
    const approvedDistinctCount = distinctTypes.size;

    // Update UserSkill
    const userSkill = await UserSkill.findById(proof.userSkillId);
    if (userSkill) {
      userSkill.approvedProofsCount = approvedDistinctCount;
      if (status === 'rejected') {
        userSkill.status = 'proofs_rejected';
      } else if (approvedDistinctCount >= 2) {
        userSkill.status = 'assessment_pending'; // Unlock assessment
      }
      await userSkill.save();
    }

    // Create notification
    await Notification.create({
      userId: proof.userId,
      type: status === 'approved' ? 'proof_approved' : 'proof_rejected',
      title: status === 'approved' ? 'Proof Approved' : 'Proof Rejected',
      message: status === 'approved'
        ? `Your proof "${proof.title}" has been approved.${approvedDistinctCount >= 2 ? ' Assessment is now unlocked!' : ''}`
        : `Your proof "${proof.title}" was rejected. Reason: ${reviewNotes || 'N/A'}`,
      referenceId: proof._id,
      referenceModel: 'SkillProof',
    });

    // Audit log
    await AuditLog.create({
      userId: req.user._id, action: `PROOF_${status.toUpperCase()}`, resource: 'SkillProof',
      resourceId: proof._id, details: { reviewNotes, proofUser: proof.userId },
    });

    res.json({ success: true, data: proof, approvedDistinctCount });
  } catch (error) { next(error); }
};

module.exports = { submitProof, getMyProofs, getPendingProofs, reviewProof };
