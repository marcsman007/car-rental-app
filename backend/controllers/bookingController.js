const Booking = require('../models/Booking');
const Car = require('../models/Car');

// --- CREATE booking ---
const createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;

    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing booking information' });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: 'Car not found' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) return res.status(400).json({ message: 'Invalid booking dates' });

    // Check for overlapping active bookings
    const overlappingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });
    if (overlappingBooking) {
      return res.status(400).json({ message: 'Car is already booked for these dates' });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalPrice = car.pricePerDay * days;

    const booking = await Booking.create({
      user: req.user._id,
      car: car._id,
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'pending'
    });

    // Mark car as unavailable
    car.available = false;
    await car.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email role')
      .populate('car');

    console.log('Booking created:', populatedBooking._id);
    res.status(201).json(populatedBooking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Failed to create booking' });
  }
};

// --- GET bookings for current user ---
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching user bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// --- GET all bookings (admin) ---
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email role')
      .populate('car');
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching all bookings:', err);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
};

// --- UPDATE booking (dates or status) ---
const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Optional: validate new dates
    if (req.body.startDate || req.body.endDate) {
      const start = req.body.startDate ? new Date(req.body.startDate) : booking.startDate;
      const end = req.body.endDate ? new Date(req.body.endDate) : booking.endDate;
      if (start >= end) return res.status(400).json({ message: 'Invalid booking dates' });

      // Check overlapping bookings for date change
      const overlapping = await Booking.findOne({
        _id: { $ne: booking._id },
        car: booking.car,
        status: { $in: ['pending', 'confirmed'] },
        $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }]
      });
      if (overlapping) return res.status(400).json({ message: 'Car is already booked for these dates' });

      booking.startDate = start;
      booking.endDate = end;

      const car = await Car.findById(booking.car);
      booking.totalPrice = car.pricePerDay * Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    // Update other fields (status)
    if (req.body.status) booking.status = req.body.status;

    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email role')
      .populate('car');

    console.log('Booking updated:', populatedBooking._id);
    res.json(populatedBooking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// --- CANCEL booking (soft cancel) ---
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    booking.status = 'canceled';
    booking.canceledAt = new Date();
    await booking.save();

    // Make car available if no other active bookings exist
    const otherActive = await Booking.findOne({
      car: booking.car,
      status: { $in: ['pending', 'confirmed'] }
    });
    if (!otherActive) {
      const car = await Car.findById(booking.car);
      if (car) {
        car.available = true;
        await car.save();
      }
    }

    console.log('Booking canceled:', booking._id);
    res.json({ message: 'Booking canceled successfully', booking });
  } catch (err) {
    console.error('Error canceling booking:', err);
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
