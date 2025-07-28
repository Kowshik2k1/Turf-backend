const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const protect = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', protect, async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate('turf');

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found' });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: booking.turf.name,
            description: `Booking for ${booking.turf.sportType} on ${booking.date} from ${booking.startTime} to ${booking.endTime}`
          },
          unit_amount: booking.totalPrice,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.CLIENT_URL}/success?bookingId=${bookingId}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
    client_reference_id: bookingId,
  });

  res.json({ id: session.id });
});

// Route to handle Stripe webhook events for successful payments
// This would be a new route for Stripe to send notifications to
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.client_reference_id;
        const booking = await Booking.findById(bookingId);

        if (booking) {
            await Payment.create({
                booking: bookingId,
                user: booking.user,
                amount: session.amount_total / 100,
                paymentStatus: 'success',
                transactionId: session.payment_intent,
            });

            // Update booking status to confirmed if needed
            // booking.status = 'confirmed';
            // await booking.save();
        }
    }

    res.status(200).end();
});

module.exports = router;