const express = require('express');
const { getRecruiterStats, getAdminStats, getAllUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/recruiter/stats', protect, authorize('recruiter'), getRecruiterStats);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);

module.exports = router;