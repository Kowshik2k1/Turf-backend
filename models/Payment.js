const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  paymentStatus: { type: String, enum: ['success', 'failed'], default: 'success' },
  transactionId: String
}, { timestamps: true });

module.exports = mongoose.model('payments', PaymentSchema);
