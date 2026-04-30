const express = require('express');
const { registerUser, loginUser, getUserProfile, googleLogin, appleLogin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/apple', appleLogin);
router.get('/me', protect, getUserProfile);

module.exports = router;
