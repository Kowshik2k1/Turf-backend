const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf' },
  date: String,
  startTime: String,
  endTime: String,
  totalPrice: Number,
  status: { type: String, enum: ['confirmed', 'cancelled', 'rescheduled'], default: 'confirmed' }
}, { timestamps: true });

module.exports = mongoose.model('bookings', BookingSchema);
