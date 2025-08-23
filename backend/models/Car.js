const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  licensePlate: { type: String, required: true, unique: true },
  available: { type: Boolean, default: true },
  pricePerDay: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
