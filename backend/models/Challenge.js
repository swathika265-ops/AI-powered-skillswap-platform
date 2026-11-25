const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructions: { type: String, default: '' },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    deadline: { type: Date },
    maxParticipants: { type: Number, default: 0 }, // 0 = unlimited
    participantCount: { type: Number, default: 0 },
    rewardCredits: { type: Number, default: 0 },
    reputationBonus: { type: Number, default: 5 },
    isActive: { type: Boolean, default: true },
    isCollaborative: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

challengeSchema.index({ isActive: 1, deadline: 1 });
challengeSchema.index({ skillId: 1 });

const challengeSubmissionSchema = new mongoose.Schema(
  {
    challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    status: { type: String, enum: ['submitted', 'under_review', 'approved', 'rejected'], default: 'submitted' },
    feedback: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

challengeSubmissionSchema.index({ challengeId: 1, userId: 1 }, { unique: true });

const Challenge = mongoose.model('Challenge', challengeSchema);
const ChallengeSubmission = mongoose.model('ChallengeSubmission', challengeSubmissionSchema);

module.exports = { Challenge, ChallengeSubmission };
