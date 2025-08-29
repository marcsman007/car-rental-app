const Car = require('../models/Car');
const Booking = require('../models/Booking');

// --- GET all cars ---
const getCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error("Error fetching cars:", err);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};

// --- ADD new car (admin only) ---
const addCar = async (req, res) => {
  try {
    const { make, model, year, licensePlate, pricePerDay } = req.body;

    const car = await Car.create({
      make,
      model,
      year: Number(year),
      licensePlate,
      pricePerDay: Number(pricePerDay),
      reviews: [],
      numReviews: 0,
      averageRating: 0,
    });

    console.log("Car added:", car);
    res.status(201).json(car);
  } catch (err) {
    console.error("Error adding car:", err);
    res.status(500).json({ message: "Failed to add car" });
  }
};

// --- UPDATE car (admin only) ---
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Prevent changing licensePlate if booked
    const activeBooking = await Booking.findOne({
      car: car._id,
      status: { $in: ["pending", "confirmed"] }
    });
    if (activeBooking && req.body.licensePlate && req.body.licensePlate !== car.licensePlate) {
      return res.status(400).json({ message: "Cannot change license plate while car is booked" });
    }

    // Convert numeric fields
    if (req.body.year !== undefined) req.body.year = Number(req.body.year);
    if (req.body.pricePerDay !== undefined) req.body.pricePerDay = Number(req.body.pricePerDay);

    Object.assign(car, req.body);
    const updatedCar = await car.save();

    console.log("Car updated:", updatedCar);
    res.json(updatedCar);
  } catch (err) {
    console.error("Error updating car:", err);
    res.status(500).json({ message: "Failed to update car" });
  }
};

// --- DELETE car (admin only) ---
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    const activeBooking = await Booking.findOne({
      car: car._id,
      status: { $in: ["pending", "confirmed"] }
    });
    if (activeBooking) {
      return res.status(400).json({ message: "Cannot delete a car that is currently booked" });
    }

    await car.deleteOne();
    console.log("Car deleted:", car._id);
    res.json({ message: "Car deleted" });
  } catch (err) {
    console.error("Error deleting car:", err);
    res.status(500).json({ message: "Failed to delete car" });
  }
};

// --- ADD a review for a car (one review per completed booking) ---
const addCarReview = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { rating, comment } = req.body;
    const car = await Car.findById(req.params.id);

    if (!car) return res.status(404).json({ message: "Car not found" });

    // --- Find a completed booking for this user & car that hasn't been reviewed yet ---
    const booking = await Booking.findOne({
      user: req.user._id,
      car: car._id,
      status: { $in: ["completed", "fulfilled", "done"] },
      reviewed: { $ne: true } // must not have been reviewed yet
    });

    if (!booking) {
      console.log(
        `User ${req.user._id} attempted to review car ${car._id} without a completed unreviewed booking`
      );
      return res.status(400).json({
        message: "You can only review after completing a booking that hasn't been reviewed yet"
      });
    }

    if (!Array.isArray(car.reviews)) car.reviews = [];

    // --- Ensure this booking hasn't already been reviewed by checking the booking.reviewed flag ---
    if (booking.reviewed) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    const review = {
      user: req.user._id,
      booking: booking._id, // link review to booking
      name: req.user.name || "Anonymous",
      rating: Number(rating),
      comment: comment || ""
    };

    car.reviews.push(review);
    car.numReviews = car.reviews.length;
    car.averageRating =
      car.reviews.reduce((sum, r) => sum + r.rating, 0) / car.reviews.length;

    await car.save();

    // --- Mark this booking as reviewed ---
    booking.reviewed = true;
    await booking.save();

    console.log("Review added:", review);

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
};

module.exports = { getCars, addCar, updateCar, deleteCar, addCarReview };
