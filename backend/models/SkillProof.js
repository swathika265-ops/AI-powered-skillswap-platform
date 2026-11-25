const mongoose = require('mongoose');

const skillProofSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    userSkillId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSkill', required: true },
    proofType: {
      type: String,
      enum: ['certificate', 'portfolio', 'course_completion', 'project_link', 'other'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    externalUrl: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    reviewNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

skillProofSchema.index({ userId: 1, skillId: 1 });
skillProofSchema.index({ status: 1 });

module.exports = mongoose.model('SkillProof', skillProofSchema);
