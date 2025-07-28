const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  turf: { type: mongoose.Schema.Types.ObjectId, ref: 'Turf' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });

ReviewSchema.index({ user: 1, turf: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
