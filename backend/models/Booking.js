const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'canceled', 'fulfilled'], // added 'fulfilled'
    default: 'pending' 
  },
  canceledAt: { type: Date },    // optional timestamp
  fulfilledAt: { type: Date }    // added to track when a booking is fulfilled
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
