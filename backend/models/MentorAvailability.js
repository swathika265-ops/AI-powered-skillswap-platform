const mongoose = require('mongoose');

const mentorAvailabilitySchema = new mongoose.Schema(
  {
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sun, 6=Sat
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "17:00"
    timezone: { type: String, default: 'UTC' },
    isRecurring: { type: Boolean, default: true },
    specificDate: { type: Date }, // for non-recurring
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mentorAvailabilitySchema.index({ mentorId: 1, dayOfWeek: 1 });

module.exports = mongoose.model('MentorAvailability', mentorAvailabilitySchema);
