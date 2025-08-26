const Car = require('../models/Car');
const Booking = require('../models/Booking');

// Get all cars
const getCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch cars" });
  }
};

// Add new car (admin)
const addCar = async (req, res) => {
  try {
    const car = await Car.create(req.body);
    res.status(201).json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add car" });
  }
};

// Update car (admin)
const updateCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Prevent editing licensePlate if booked
    const activeBooking = await Booking.findOne({
      car: car._id,
      status: { $in: ["pending", "confirmed"] }
    });
    if (
      activeBooking &&
      req.body.licensePlate &&
      req.body.licensePlate !== car.licensePlate
    ) {
      return res
        .status(400)
        .json({ message: "Cannot change license plate while car is booked" });
    }

    Object.assign(car, req.body);
    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update car" });
  }
};

// Delete car (admin)
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // Prevent deleting if car is booked
    const activeBooking = await Booking.findOne({
      car: car._id,
      status: { $in: ["pending", "confirmed"] }
    });
    if (activeBooking)
      return res
        .status(400)
        .json({ message: "Cannot delete a car that is currently booked" });

    await car.deleteOne();
    res.json({ message: "Car deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete car" });
  }
};

// ⭐ Add a review for a car (crash-proof with debug logs)
const addCarReview = async (req, res) => {
  try {
    console.log("Request user:", req.user); // Debug log

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { rating, comment } = req.body;
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (!car.reviews) car.reviews = []; // Ensure reviews array exists
    console.log("Existing reviews:", car.reviews); // Debug log

    const alreadyReviewed = car.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      console.log("Duplicate review detected for user:", req.user._id);
      return res.status(400).json({ message: "You have already reviewed this car" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name || "Anonymous",
      rating: Number(rating),
      comment: comment || ""
    };

    car.reviews.push(review);
    car.numReviews = car.reviews.length;
    car.averageRating =
      car.reviews.reduce((acc, r) => acc + r.rating, 0) / car.reviews.length;

    await car.save();
    console.log("Review saved:", review); // Debug log

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    console.error("Error adding review:", err);
    res.status(500).json({ message: "Failed to add review" });
  }
};

module.exports = { getCars, addCar, updateCar, deleteCar, addCarReview };
