const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const cors = require('cors');
const Booking = require('./models/Booking');
const path = require("path");

dotenv.config();
connectDB(); // ✅ uncomment this

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://13.229.78.22:5000", credentials: true }));

// Test route
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);

// --- Serve React frontend ---
app.use(express.static(path.join(__dirname, "frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
