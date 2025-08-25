const Booking = require('../models/Booking');
const Car = require('../models/Car');

// Create booking
const createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    // Check overlapping active bookings only
    const overlappingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed'] }, // only active bookings
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
      .populate('car');
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

// Cancel booking (soft cancel) - owner or admin
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Allow booking owner or admin to cancel
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Soft cancel
    booking.status = 'canceled';
    booking.canceledAt = new Date();
    await booking.save();

    // Make the car available only if no other active bookings exist
    const otherActiveBooking = await Booking.findOne({
      car: booking.car,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (!otherActiveBooking) {
      const car = await Car.findById(booking.car);
      if (car) {
        car.available = true;
        await car.save();
      }
    }

    res.json({ message: 'Booking canceled successfully', booking });
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
