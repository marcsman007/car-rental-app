const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const usersRoutes = require('./routes/usersRoutes'); // <-- Corrected import
const cors = require('cors');
const Booking = require('./models/Booking');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(express.json());
// Allow all origins; safe since frontend is served from same server
app.use(cors({ origin: true, credentials: true }));

// --- Test route ---
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

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', usersRoutes); // <-- Register users route

// --- Serve React Frontend ---
const frontendBuildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendBuildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`)
);
