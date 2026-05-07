const User = require('../models/User');
const Match = require('../models/Match');
const Job = require('../models/Job');
const Application = require('../models/Application');

const getRecruiterStats = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id });
    
    // Fetch all applications for these jobs
    const applications = await Application.find({ recruiterId: req.user._id })
      .populate('candidateId', 'name email role')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 })
      .limit(10); // recent 10

    const totalApplicantsCount = await Application.countDocuments({ recruiterId: req.user._id });

    // Calculate average match score safely
    const allApps = await Application.find({ recruiterId: req.user._id }).select('matchScore');
    let avgScore = 0;
    if (allApps.length > 0) {
      const sum = allApps.reduce((acc, app) => acc + app.matchScore, 0);
      avgScore = Math.floor(sum / allApps.length);
    }

    const stats = {
      totalJDs: jobs.length,
      totalApplicants: totalApplicantsCount,
      avgMatchScore: avgScore,
      recentApplicants: applications.map(app => ({
        id: app._id,
        name: app.candidateId?.name || 'Unknown',
        role: app.jobId?.title || 'Unknown Role',
        score: app.matchScore,
        status: app.status
      }))
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

const getCandidateAnalytics = async (req, res) => {
  try {
    const { id } = req.params; // This is now the Application ID!
    
    const application = await Application.findById(id).populate('candidateId', 'name email');
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify ownership (the recruiter asking must own the job)
    if (application.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to view this application' });
    }

    // Map application data to the format CandidateAnalytics.jsx expects
    const analyticsData = {
      id: application._id,
      name: application.candidateId?.name || 'Unknown Candidate',
      role: 'Applicant',
      score: application.matchScore,
      status: application.status,
      atsScore: application.atsScore,
      email: application.candidateId?.email || 'N/A',
      phone: "Not Provided", // Could come from candidate profile if we had it
      experience: "N/A",
      matchedKeywords: application.matchedKeywords,
      missingKeywords: application.missingKeywords,
      skillsList: application.skillsList,
      ranking: 1, // Mock ranking since we don't have the complex aggregation built yet
      totalApplicants: await Application.countDocuments({ jobId: application.jobId })
    };

    res.json(analyticsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const applications = await Application.find({ 
      jobId, 
      recruiterId: req.user._id 
    })
    .populate('candidateId', 'name email')
    .sort({ createdAt: -1 });

    const formattedApps = applications.map(app => ({
      id: app._id,
      candidateId: app.candidateId?._id,
      candidateName: app.candidateId?.name,
      candidateEmail: app.candidateId?.email,
      matchScore: app.matchScore,
      status: app.status,
      createdAt: app.createdAt
    }));

    res.json(formattedApps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getRecruiterStats, 
  getAdminStats, 
  getAllUsers, 
  getCandidateAnalytics,
  getJobApplications 
};