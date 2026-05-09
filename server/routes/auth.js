const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, googleLogin, appleLogin, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.post('/google', googleLogin);
router.post('/apple', appleLogin);
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);

module.exports = router;
