const express = require('express');
const router = express.Router();
const { 
  createJob, 
  getMyJobs, 
  getJobById, 
  updateJob, 
  deleteJob 
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('recruiter'), createJob);
router.get('/my', protect, authorize('recruiter'), getMyJobs);
router.get('/:id', protect, getJobById);
router.put('/:id', protect, authorize('recruiter'), updateJob);
router.delete('/:id', protect, authorize('recruiter'), deleteJob);

module.exports = router;
