const express = require('express');
const router = express.Router();
const { saveResume, getResume, generateAiContent, getTemplates } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');

router.get('/templates', getTemplates);
router.post('/save', protect, saveResume);
router.get('/', protect, getResume);
router.post('/generate-ai', protect, generateAiContent);

module.exports = router;
