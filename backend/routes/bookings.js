const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createBooking, confirmBooking, cancelBooking, completeBooking, addMeetingLink, getBookings, getBookingById } = require('../controllers/bookingController');

router.get('/', authenticate, getBookings);
router.post('/', authenticate, createBooking);
router.get('/:id', authenticate, getBookingById);
router.patch('/:id/confirm', authenticate, confirmBooking);
router.patch('/:id/cancel', authenticate, cancelBooking);
router.patch('/:id/complete', authenticate, completeBooking);
router.patch('/:id/meeting-link', authenticate, addMeetingLink);

module.exports = router;
