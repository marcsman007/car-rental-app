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
    const activeBooking = await Booking.findOne({ car: car._id, status: { $in: ["pending", "confirmed"] } });
    if (activeBooking && req.body.licensePlate && req.body.licensePlate !== car.licensePlate) {
      return res.status(400).json({ message: "Cannot change license plate while car is booked" });
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
    const activeBooking = await Booking.findOne({ car: car._id, status: { $in: ["pending", "confirmed"] } });
    if (activeBooking) return res.status(400).json({ message: "Cannot delete a car that is currently booked" });

    await car.deleteOne();
    res.json({ message: "Car deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete car" });
  }
};

module.exports = { getCars, addCar, updateCar, deleteCar };
