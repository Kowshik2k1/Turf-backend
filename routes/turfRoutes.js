const express = require('express');
const router = express.Router();
const Turf = require('../models/Turf');
const protect = require('../middleware/auth');
const permit = require('../middleware/permit');

router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Only admin can create turfs');

  const turf = await Turf.create(req.body);
  res.status(201).json(turf);
});

router.get('/', async (req, res) => {
  const turfs = await Turf.find();
  res.json(turfs);
});

router.get('/:id', async (req, res) => {
  const turf = await Turf.findById(req.params.id);
  if (!turf) return res.status(404).send('Turf not found');
  res.json(turf);
});

router.get('/', async (req, res) => {
  const { location, sportType, minPrice, maxPrice } = req.query;
  const filters = { isActive: true };

  if (location) {
    filters.location = { $regex: location, $options: 'i' };
  }
  if (sportType) {
    filters.sportType = sportType;
  }
  if (minPrice) {
    filters.pricePerHour = { ...filters.pricePerHour, $gte: minPrice };
  }
  if (maxPrice) {
    filters.pricePerHour = { ...filters.pricePerHour, $lte: maxPrice };
  }

  const turfs = await Turf.find(filters);
  res.json(turfs);
});

// // New route for uploading turf images
// router.post('/:id/upload-images', protect, permit('admin', 'manager'), upload.array('images', 5), async (req, res) => {
//   const turf = await Turf.findById(req.params.id);
//   if (!turf) return res.status(404).send('Turf not found');

//   // Check if the user is an admin or the manager of this turf
//   if (req.user.role !== 'admin' && turf.manager.toString() !== req.user.id) {
//     return res.status(403).send('Unauthorized');
//   }

//   const imageUrls = req.files.map(file => file.path);
//   turf.images.push(...imageUrls);
//   await turf.save();

//   res.json(turf);
// });

module.exports = router;