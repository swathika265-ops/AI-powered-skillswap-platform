const mongoose = require('mongoose');

const assessmentEventSchema = new mongoose.Schema(
  {
    attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentAttempt', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventType: {
      type: String,
      enum: ['started', 'tab_switch', 'fullscreen_exit', 'visibility_change', 'warning_shown', 'auto_submitted', 'auto_failed', 'completed', 'answer_changed'],
      required: true,
    },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

assessmentEventSchema.index({ attemptId: 1 });

module.exports = mongoose.model('AssessmentEvent', assessmentEventSchema);
