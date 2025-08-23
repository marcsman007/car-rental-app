const express = require('express');
const {
  createBooking,
  getUserBookings,
  updateBooking,
  deleteBooking
} = require('../controllers/bookingController');

const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create a new booking
router.post('/', protect, createBooking);

// ✅ Updated route to match frontend
router.get('/mybookings', protect, getUserBookings);

// Update a booking by ID
router.patch('/:id', protect, updateBooking);

// Cancel (delete) a booking by ID
router.delete('/:id', protect, deleteBooking);

module.exports = router;
