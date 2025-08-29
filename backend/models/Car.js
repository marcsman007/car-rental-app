const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    booking: {  // 🔹 link review to a booking
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true }
  },
  { timestamps: true }
);

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true, unique: true },
    available: { type: Boolean, default: true },
    pricePerDay: { type: Number, required: true },

    // ⭐ Review system
    reviews: { type: [reviewSchema], default: [] }, // ✅ default empty array
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);
