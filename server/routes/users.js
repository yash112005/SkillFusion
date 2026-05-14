const express = require('express');
const { getRecruiterStats, getAdminStats, getAllUsers, getCandidateAnalytics, getJobApplications, getRecruiterInsights } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/recruiter/stats', protect, authorize('recruiter'), getRecruiterStats);
router.get('/recruiter/applications', protect, authorize('recruiter'), getJobApplications);
router.get('/recruiter/candidate/:id', protect, authorize('recruiter'), getCandidateAnalytics);
router.get('/recruiter/insights', protect, authorize('recruiter'), getRecruiterInsights);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);

module.exports = router;