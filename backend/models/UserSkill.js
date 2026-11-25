const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    type: { type: String, enum: ['learning', 'teaching'], required: true },
    proficiencyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'beginner' },
    targetLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
    status: {
      type: String,
      enum: ['learning_interest', 'proofs_pending', 'proofs_rejected', 'assessment_pending', 'assessment_in_progress', 'verified', 'suspended'],
      default: 'learning_interest',
    },
    goals: { type: String, default: '' },
    approvedProofsCount: { type: Number, default: 0 },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

userSkillSchema.index({ userId: 1, skillId: 1, type: 1 }, { unique: true });
userSkillSchema.index({ status: 1 });
userSkillSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('UserSkill', userSkillSchema);
