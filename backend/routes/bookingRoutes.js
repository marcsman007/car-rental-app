const express = require('express');
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
  fulfillBooking // ✅ import new controller
} = require('../controllers/bookingController');

const { protect, admin } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new booking (user)
router.post('/', protect, createBooking);

// Get bookings for logged-in user
router.get('/mybookings', protect, getUserBookings);

// Get all bookings (admin only)
router.get('/', protect, admin, getAllBookings);

// Update a booking by ID (admin only for status update)
router.patch('/:id', protect, admin, updateBooking);

// Fulfill a booking by ID (admin only)
router.patch('/:id/fulfill', protect, admin, fulfillBooking);

// Cancel a booking by ID (user can cancel own booking, admin can cancel any)
router.delete('/:id', protect, deleteBooking);

module.exports = router;
