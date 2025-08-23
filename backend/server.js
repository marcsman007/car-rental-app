const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cors = require('cors'); // 👈 import cors
const Booking = require('./models/Booking');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// 👈 Enable CORS for frontend
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// --- Temporary test route ---
app.get('/api/bookings/test', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('car')
      .populate('user', 'name email');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// --- End temporary route ---

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
