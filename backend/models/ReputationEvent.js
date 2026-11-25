const mongoose = require('mongoose');

const reputationEventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    change: { type: Number, required: true },
    reason: { type: String, required: true },
    category: {
      type: String,
      enum: ['session_completed', 'rating_received', 'no_show', 'cancellation', 'complaint', 'challenge_completed', 'bonus'],
      required: true,
    },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceModel: { type: String },
    scoreBefore: { type: Number, required: true },
    scoreAfter: { type: Number, required: true },
  },
  { timestamps: true }
);

reputationEventSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ReputationEvent', reputationEventSchema);
