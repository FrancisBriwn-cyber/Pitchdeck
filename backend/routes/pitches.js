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

router.post('/', authenticate, pitchCreateLimiter, upload.single('cover_image'), createPitch);
router.put('/:id', authenticate, upload.single('cover_image'), updatePitch);
router.delete('/:id', authenticate, deletePitch);

router.post('/:id/feedback', authenticate, feedbackLimiter, submitFeedback);

module.exports = router;
