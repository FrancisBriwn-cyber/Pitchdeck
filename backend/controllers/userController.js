const pool = require('../db');

// GET /api/users/:id — user profile + their pitches
const getUserProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      'SELECT id, name, email, role, bio, stage, industry, looking_for, location, linkedin_url, team_size, created_at FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const pitchResult = await pool.query(`
      SELECT p.*, u.name AS author_name,
        (SELECT COUNT(*) FROM feedback f WHERE f.pitch_id = p.id) AS feedback_count
      FROM pitches p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
    `, [id]);

    const feedbackGivenResult = await pool.query(
      'SELECT COUNT(*) FROM feedback WHERE user_id = $1',
      [id]
    );

    res.json({
      user: userResult.rows[0],
      pitches: pitchResult.rows,
      feedbackGiven: parseInt(feedbackGivenResult.rows[0].count, 10),
    });
  } catch (err) {
    console.error('User profile error:', err);
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
};

module.exports = { getUserProfile };
