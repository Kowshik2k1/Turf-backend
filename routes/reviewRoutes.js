const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const protect = require('../middleware/auth');

// Create review
router.post('/', protect, async (req, res) => {
  const { turf, rating, comment } = req.body;

  const review = await Review.create({
    user: req.user.id,
    turf,
    rating,
    comment
  });

  res.status(201).json(review);
});

// Get all reviews for a turf
router.get('/:turfId', async (req, res) => {
  const reviews = await Review.find({ turf: req.params.turfId }).populate('user', 'name');
  res.json(reviews);
});

module.exports = router;
