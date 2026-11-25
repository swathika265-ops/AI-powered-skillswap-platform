const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'proof_approved', 'proof_rejected', 'assessment_available', 'assessment_result',
        'booking_request', 'booking_confirmed', 'booking_cancelled', 'booking_completed',
        'meeting_link', 'session_reminder', 'new_message', 'credit_earned', 'credit_spent',
        'reputation_change', 'new_review', 'roadmap_milestone', 'challenge_deadline',
        'admin_action', 'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceModel: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
