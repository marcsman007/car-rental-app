const express = require('express');
const router = express.Router();
const { 
  getCars, 
  addCar, 
  updateCar, 
  deleteCar, 
  addCarReview,
  addReviewReply, // admin reply
  addReviewNote   // admin internal note
} = require('../controllers/carController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Get all cars
router.get('/', protect, getCars);

// Admin: Add new car
router.post('/', protect, admin, addCar);

// Admin: Update car
router.patch('/:id', protect, admin, updateCar);

// Admin: Delete car
router.delete('/:id', protect, admin, deleteCar);

// User: Add a review to a car
router.post('/:id/reviews', protect, addCarReview);

// Admin: Add or update a reply to a review
router.put('/:carId/reviews/:reviewId/reply', protect, admin, addReviewReply);

// Admin: Add or update an internal note for a review
router.put('/:carId/reviews/:reviewId/note', protect, admin, addReviewNote);

module.exports = router;
