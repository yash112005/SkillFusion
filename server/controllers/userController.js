const User = require('../models/User');
const Match = require('../models/Match');
const Job = require('../models/Job');

const getRecruiterStats = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id });
    
    const stats = {
      totalJDs: jobs.length,
      totalApplicants: jobs.length * Math.floor(Math.random() * 20 + 5),
      avgMatchScore: Math.floor(Math.random() * 20 + 65),
      recentApplicants: [
        { name: "Alice Smith", role: "Frontend Dev", score: 88, status: 'Reviewed' },
        { name: "Bob Jones", role: "Backend Eng", score: 76, status: 'Pending' },
        { name: "Charlie Davis", role: "Fullstack", score: 92, status: 'Interview' }
      ]
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMatches = await Match.countDocuments();
    
    const candidatesCount = await User.countDocuments({ role: 'candidate' });
    const recruitersCount = await User.countDocuments({ role: 'recruiter' });
    
    const stats = {
      totalUsers,
      totalMatches,
      candidatesCount,
      recruitersCount,
      revenue: totalUsers * 10
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getRecruiterStats, getAdminStats, getAllUsers };