const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { register, login } = require('../controllers/authController');
const { registerLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const pool = require('../db');

// Email / password
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);

// Fetch current user from DB (used after OAuth to get real user object)
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// Google OAuth — redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google OAuth — callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // req.user is { user, token } set by the Passport strategy
    const { token } = req.user;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // Send token back to the frontend via redirect with query param
    res.redirect(`${clientUrl}/oauth-callback?token=${token}`);
  }
);

module.exports = router;
