const pool = require('../db');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper: upload buffer to Cloudinary via stream
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pitchdeck', resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// GET /api/pitches — all pitches, newest first
const getAllPitches = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.name AS author_name,
        (SELECT COUNT(*) FROM feedback f WHERE f.pitch_id = p.id) AS feedback_count,
        (SELECT COUNT(*) FROM feedback f WHERE f.pitch_id = p.id AND f.would_use = true) AS would_use_count
      FROM pitches p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get pitches error:', err);
    res.status(500).json({ error: 'Failed to fetch pitches.' });
  }
};

// GET /api/pitches/search?q=keyword
const searchPitches = async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  try {
    const result = await pool.query(`
      SELECT p.*, u.name AS author_name,
        (SELECT COUNT(*) FROM feedback f WHERE f.pitch_id = p.id) AS feedback_count,
        (SELECT COUNT(*) FROM feedback f WHERE f.pitch_id = p.id AND f.would_use = true) AS would_use_count
      FROM pitches p
      JOIN users u ON p.user_id = u.id
      WHERE to_tsvector('english', p.name || ' ' || p.one_liner || ' ' || p.problem || ' ' || p.solution)
        @@ plainto_tsquery('english', $1)
      ORDER BY p.created_at DESC
    `, [q.trim()]);

    res.json(result.rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed.' });
  }
};

// GET /api/pitches/:id — single pitch with feedback
const getPitchById = async (req, res) => {
  const { id } = req.params;
  try {
    const pitchResult = await pool.query(`
      SELECT p.*, u.name AS author_name,
        (SELECT COUNT(*) FROM feedback f WHERE f.pitch_id = p.id) AS feedback_count
      FROM pitches p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `, [id]);

    if (pitchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pitch not found.' });
    }

    const feedbackResult = await pool.query(`
      SELECT f.*, u.name AS reviewer_name
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      WHERE f.pitch_id = $1
      ORDER BY f.created_at DESC
    `, [id]);

    res.json({ ...pitchResult.rows[0], feedback: feedbackResult.rows });
  } catch (err) {
    console.error('Get pitch error:', err);
    res.status(500).json({ error: 'Failed to fetch pitch.' });
  }
};

// POST /api/pitches — create pitch
const createPitch = async (req, res) => {
  const { name, one_liner, problem, solution, target_market } = req.body;

  if (!name || !one_liner || !problem || !solution || !target_market) {
    return res.status(400).json({ error: 'All fields (name, one_liner, problem, solution, target_market) are required.' });
  }

  let cover_image_url = null;

  if (req.file) {
    try {
      const uploaded = await uploadToCloudinary(req.file.buffer);
      cover_image_url = uploaded.secure_url;
    } catch (uploadErr) {
      console.error('Cloudinary error:', uploadErr);
      return res.status(502).json({ error: 'Image upload failed. Try a smaller file or a different format.' });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO pitches (user_id, name, one_liner, problem, solution, target_market, cover_image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, name, one_liner, problem, solution, target_market, cover_image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create pitch error:', err);
    res.status(500).json({ error: 'Failed to save pitch. Please try again.' });
  }
};

// PUT /api/pitches/:id — edit pitch (owner only)
const updatePitch = async (req, res) => {
  const { id } = req.params;
  const { name, one_liner, problem, solution, target_market } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM pitches WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pitch not found.' });
    }

    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You can only edit your own pitches.' });
    }

    let cover_image_url = existing.rows[0].cover_image_url;
    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer);
      cover_image_url = uploaded.secure_url;
    }

    const result = await pool.query(
      `UPDATE pitches
       SET name = COALESCE($1, name),
           one_liner = COALESCE($2, one_liner),
           problem = COALESCE($3, problem),
           solution = COALESCE($4, solution),
           target_market = COALESCE($5, target_market),
           cover_image_url = $6,
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, one_liner, problem, solution, target_market, cover_image_url, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update pitch error:', err);
    res.status(500).json({ error: 'Failed to update pitch.' });
  }
};

// DELETE /api/pitches/:id — delete pitch (owner only)
const deletePitch = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM pitches WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Pitch not found.' });
    }

    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You can only delete your own pitches.' });
    }

    await pool.query('DELETE FROM pitches WHERE id = $1', [id]);
    res.json({ message: 'Pitch deleted successfully.' });
  } catch (err) {
    console.error('Delete pitch error:', err);
    res.status(500).json({ error: 'Failed to delete pitch.' });
  }
};

module.exports = { getAllPitches, searchPitches, getPitchById, createPitch, updatePitch, deletePitch };
