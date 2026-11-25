const mongoose = require('mongoose');

const learningRoadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    title: { type: String, required: true },
    currentLevel: { type: String, default: 'beginner' },
    targetLevel: { type: String, default: 'advanced' },
    weeklyHours: { type: Number, default: 5 },
    preferredLanguage: { type: String, default: 'English' },
    goals: { type: String, default: '' },
    stages: [{
      title: { type: String, required: true },
      description: { type: String, default: '' },
      topics: [String],
      exercises: [String],
      miniProject: { type: String, default: '' },
      estimatedHours: { type: Number, default: 5 },
      order: { type: Number, required: true },
      isCompleted: { type: Boolean, default: false },
      completedAt: { type: Date },
    }],
    overallProgress: { type: Number, default: 0, min: 0, max: 100 },
    estimatedWeeks: { type: Number, default: 0 },
    generatedBy: { type: String, enum: ['ai', 'rule_based'], default: 'rule_based' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

learningRoadmapSchema.index({ userId: 1, skillId: 1 });

module.exports = mongoose.model('LearningRoadmap', learningRoadmapSchema);
