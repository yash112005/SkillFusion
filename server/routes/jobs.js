const express = require('express');
const router = express.Router();
const { 
  createJob, 
  getMyJobs, 
  getJobById, 
  updateJob, 
  deleteJob,
  getRecommendedJobs,
  applyForJob,
  getJobInsights
} = require('../controllers/jobController');
const { getBiasAnalysis, getInclusiveRewrite } = require('../controllers/biasController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('candidate'), getRecommendedJobs);
router.post('/', protect, authorize('recruiter'), createJob);
router.get('/my', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', protect, getJobById);
router.get('/:id/insights', protect, authorize('recruiter'), getJobInsights);
router.post('/:id/apply', protect, authorize('candidate'), applyForJob);
router.post('/analyze-bias', protect, authorize('recruiter'), getBiasAnalysis);
router.post('/fix-bias', protect, authorize('recruiter'), getInclusiveRewrite);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
