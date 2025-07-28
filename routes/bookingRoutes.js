const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const protect = require('../middleware/auth');
const permit = require('../middleware/permit');
const { sendBookingConfirmation } = require('../services/emailService');

router.post('/', protect, async (req, res) => {
  const { turf, date, startTime, endTime, totalPrice } = req.body;

  const existing = await Booking.findOne({
    turf,
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: 'confirmed'
  });

  if (existing) return res.status(409).json({ message: 'Slot already booked' });

  const booking = await Booking.create({
    user: req.user.id,
    turf,
    date,
    startTime,
    endTime,
    totalPrice
  });

  // Fetch user and turf details to send email
  const newBooking = await Booking.findById(booking._id).populate('user turf');
  await sendBookingConfirmation(newBooking.user.email, newBooking);

  res.status(201).json(booking);
});

router.get('/user/:id', protect, async (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).send('Unauthorized');
  const bookings = await Booking.find({ user: req.params.id }).populate('turf');
  res.json(bookings);
});

// Get a single booking by ID
router.get('/:id', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('turf');
  if (!booking) return res.status(404).send('Booking not found');
  if (booking.user.toString() !== req.user.id) return res.status(403).send('Unauthorized');
  res.json(booking);
});

// Cancel a booking
router.put('/cancel/:id', protect, async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).send('Booking not found');
  if (booking.user.toString() !== req.user.id) return res.status(403).send('Unauthorized');

  booking.status = 'cancelled';
  await booking.save();
  res.json({ message: 'Booking cancelled' });
});

// Reschedule a booking
router.put('/reschedule/:id', protect, async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).send('Booking not found');
  if (booking.user.toString() !== req.user.id) return res.status(403).send('Unauthorized');

  // Check for existing bookings at the new time slot
  const existing = await Booking.findOne({
    turf: booking.turf,
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: 'confirmed'
  });

  if (existing) return res.status(409).json({ message: 'New slot already booked' });

  booking.date = date;
  booking.startTime = startTime;
  booking.endTime = endTime;
  booking.status = 'rescheduled';
  await booking.save();

  res.json(booking);
});

// Get booking history for logged-in user
router.get('/user/history', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('turf');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update booking (cancel or reschedule) - only for manager
router.patch('/:id', protect, permit('manager'), async (req, res) => {
  try {
    const { date, startTime, endTime, status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (status) booking.status = status; // e.g., 'cancelled'
    if (date) booking.date = date;
    if (startTime) booking.startTime = startTime;
    if (endTime) booking.endTime = endTime;

    await booking.save();

    res.json({ message: 'Booking updated', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;