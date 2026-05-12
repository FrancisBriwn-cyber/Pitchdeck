require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('./config/passport');
const { generalLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const pitchRoutes = require('./routes/pitches');
const userRoutes = require('./routes/users');

const app = express();

// CORS — allow local dev and production Vercel domain
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// General rate limiter on all routes
app.use(generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pitches', pitchRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'PitchDeck API is running.' }));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found.' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`PitchDeck server running on port ${PORT}`));
