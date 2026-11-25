const mongoose = require('mongoose');

const assessmentAttemptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    userSkillId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserSkill', required: true },
    questions: [{
      questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentQuestion' },
      selectedAnswer: { type: Number, default: -1 },
      isCorrect: { type: Boolean, default: false },
      marks: { type: Number, default: 0 },
    }],
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passThreshold: { type: Number, default: 70 },
    passed: { type: Boolean, default: false },
    status: { type: String, enum: ['in_progress', 'completed', 'auto_failed', 'timed_out'], default: 'in_progress' },
    violations: { type: Number, default: 0 },
    maxViolations: { type: Number, default: 3 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration: { type: Number, default: 30 }, // minutes
    timeSpent: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

assessmentAttemptSchema.index({ userId: 1, skillId: 1 });
assessmentAttemptSchema.index({ status: 1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
