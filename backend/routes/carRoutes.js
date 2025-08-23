const express = require('express');
const router = express.Router();
const { getCars, addCar, updateCar, deleteCar } = require('../controllers/carController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', protect, getCars);         // All users
router.post('/', protect, admin, addCar);  // Admin only
router.patch('/:id', protect, admin, updateCar);  // Admin only
router.delete('/:id', protect, admin, deleteCar); // Admin only

module.exports = router;
