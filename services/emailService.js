// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Booking Confirmation',
    html: `<h1>Your Turf Booking is Confirmed!</h1>
           <p>Booking ID: ${bookingDetails._id}</p>
           <p>Turf: ${bookingDetails.turf.name}</p>
           <p>Date: ${bookingDetails.date}</p>
           <p>Time: ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
           <p>Total Price: ${bookingDetails.totalPrice}</p>`
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingConfirmation };