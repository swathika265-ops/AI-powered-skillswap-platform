const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, required: true, min: 15 }, // minutes
    creditAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
    },
    meetingUrl: { type: String, default: '' },
    meetingProvider: { type: String, enum: ['google_meet', 'zoom', 'teams', 'other', ''], default: '' },
    notes: { type: String, default: '' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelReason: { type: String, default: '' },
    completedAt: { type: Date },
    learnerJoined: { type: Boolean, default: false },
    mentorJoined: { type: Boolean, default: false },
  },
  { timestamps: true }
);

bookingSchema.index({ learnerId: 1, status: 1 });
bookingSchema.index({ mentorId: 1, status: 1 });
bookingSchema.index({ scheduledAt: 1 });
bookingSchema.index({ mentorId: 1, scheduledAt: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
