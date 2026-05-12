const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pitchCreateLimiter, feedbackLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const {
  getAllPitches,
  searchPitches,
  getPitchById,
  createPitch,
  updatePitch,
  deletePitch,
} = require('../controllers/pitchController');
const { submitFeedback } = require('../controllers/feedbackController');

router.get('/', getAllPitches);
router.get('/search', searchPitches);
router.get('/:id', getPitchById);

const handleUpload = (req, res, next) => {
  upload.single('cover_image')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ error: 'Image is too large — max 5 MB.' });
    if (err.message)
      return res.status(400).json({ error: err.message });
    next(err);
  });
};

router.post('/', authenticate, pitchCreateLimiter, handleUpload, createPitch);
router.put('/:id', authenticate, handleUpload, updatePitch);
router.delete('/:id', authenticate, deletePitch);

router.post('/:id/feedback', authenticate, feedbackLimiter, submitFeedback);

module.exports = router;
