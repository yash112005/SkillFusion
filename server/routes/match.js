const express = require('express');
const multer = require('multer');
const { 
  generateMatch, 
  getMatchHistory, 
  getUsageInfo, 
  submitFeedback, 
  compareMultiJD
} = require('../controllers/matchController');
const { handleSkillyChat } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer();

router.post('/', protect, upload.fields([{ name: 'resume', maxCount: 1 }, { name: 'jd', maxCount: 1 }]), generateMatch);
router.post('/compare-multi', protect, upload.fields([{ name: 'resume', maxCount: 1 }]), compareMultiJD);
router.post('/skilly-chat', protect, handleSkillyChat);
router.get('/history', protect, getMatchHistory);
router.get('/usage', protect, getUsageInfo);
router.post('/feedback', protect, submitFeedback);


module.exports = router;
