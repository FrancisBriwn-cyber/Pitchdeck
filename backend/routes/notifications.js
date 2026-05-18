const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /api/notifications — latest 20 notifications for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.pitch_id, p.name AS pitch_name, n.actor_name, n.is_read, n.created_at
       FROM notifications n
       JOIN pitches p ON p.id = n.pitch_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PATCH /api/notifications/read-all — mark all notifications as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
      [req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

module.exports = router;
