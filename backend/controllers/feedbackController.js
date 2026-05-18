const pool = require('../db');

// POST /api/pitches/:id/feedback — submit feedback (no self-feedback)
const submitFeedback = async (req, res) => {
  const { id: pitch_id } = req.params;
  const { what_i_like, would_change, would_use } = req.body;

  if (!what_i_like || !would_change || would_use === undefined) {
    return res.status(400).json({ error: 'All feedback fields (what_i_like, would_change, would_use) are required.' });
  }

  try {
    // Check pitch exists and get owner
    const pitchResult = await pool.query('SELECT user_id FROM pitches WHERE id = $1', [pitch_id]);
    if (pitchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pitch not found.' });
    }

    // Block self-feedback
    if (pitchResult.rows[0].user_id === req.user.id) {
      return res.status(403).json({ error: 'You cannot submit feedback on your own pitch.' });
    }

    // Block duplicate feedback
    const existing = await pool.query(
      'SELECT id FROM feedback WHERE pitch_id = $1 AND user_id = $2',
      [pitch_id, req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'You have already submitted feedback on this pitch.' });
    }

    const result = await pool.query(
      `INSERT INTO feedback (pitch_id, user_id, what_i_like, would_change, would_use)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [pitch_id, req.user.id, what_i_like, would_change, would_use]
    );

    // Notify the pitch owner (fire-and-forget — don't fail the request if this errors)
    pool.query(
      `INSERT INTO notifications (user_id, pitch_id, actor_name)
       VALUES ($1, $2, $3)`,
      [pitchResult.rows[0].user_id, pitch_id, req.user.name]
    ).catch((e) => console.error('Notification insert error:', e));

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback.' });
  }
};

module.exports = { submitFeedback };
