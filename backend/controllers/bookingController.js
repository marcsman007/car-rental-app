const Booking = require('../models/Booking');
const Car = require('../models/Car');

// Create booking
const createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // Check overlapping bookings
    const overlappingBooking = await Booking.findOne({
      car: carId,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (overlappingBooking) return res.status(400).json({ message: 'Car is already booked for these dates' });

    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return res.status(400).json({ message: 'Invalid booking dates' });

    const totalPrice = car.pricePerDay * days;

    const booking = await Booking.create({
      user: req.user._id,
      car: car._id,
      startDate,
      endDate,
      totalPrice,
      status: 'pending'
    });

    // Mark car as unavailable
    car.available = false;
    await car.save();

    // Populate booking for frontend
    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email role')
      .populate('car');

    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// Get bookings for current logged-in user
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car'); // populate car info
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Get all bookings (admin)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email role')
      .populate('car');
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// Update booking (status)
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    Object.assign(booking, req.body);
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email role')
      .populate('car');

    res.json(populatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// Cancel booking
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Make car available again
    const car = await Car.findById(booking.car);
    if (car) {
      car.available = true;
      await car.save();
    }

    await booking.deleteOne();
    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  updateBooking,
  deleteBooking
};
