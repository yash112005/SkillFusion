const express = require('express');
const multer = require('multer');
const { generateMatch, getMatchHistory } = require('../controllers/matchController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', protect, upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'jd', maxCount: 1 }]), generateMatch);
router.get('/history', protect, getMatchHistory);

module.exports = router;
