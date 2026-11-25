const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }, // positive=earned, negative=spent
    type: { type: String, enum: ['earned', 'spent', 'refund', 'bonus', 'adjustment'], required: true },
    reason: { type: String, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    balanceAfter: { type: Number, required: true },
    idempotencyKey: { type: String, unique: true, sparse: true }, // prevent duplicates
  },
  { timestamps: true }
);

creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index({ bookingId: 1 });

module.exports = mongoose.model('CreditTransaction', creditTransactionSchema);
