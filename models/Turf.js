const mongoose = require('mongoose');

const TurfSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  sportType: String,
  location: String,
  pricePerHour: Number,
  images: [String],
  isActive: { type: Boolean, default: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('turfs', TurfSchema);
