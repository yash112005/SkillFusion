const Job = require('../models/Job');
const Application = require('../models/Application');

const createJob = async (req, res) => {
  try {
    const { title, company, location, type, skills, experience, description } = req.body;

    const job = await Job.create({
      recruiterId: req.user._id,
      title,
      company,
      location,
      type,
      skills,
      experience,
      description
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({ message: 'Job removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecommendedJobs = async (req, res) => {
  try {
    // Fetch all available jobs
    const jobs = await Job.find({}).sort({ createdAt: -1 }).lean();
    
    // Simulate a deterministic match score for the candidate based on job ID
    // In a real app, this would use AI/Keywords matched against candidate's profile
    const jobsWithScores = jobs.map(job => {
      // Deterministic pseudo-random number based on the string length and character codes
      const hashStr = req.user._id.toString() + job._id.toString();
      let hash = 0;
      for (let i = 0; i < hashStr.length; i++) {
        hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
        hash = hash & hash;
      }
      
      // Map hash to a score between 65 and 98
      const pseudoRandom = Math.abs(hash) % 34;
      const matchScore = 65 + pseudoRandom;
      
      return {
        ...job,
        matchScore
      };
    });

    // Sort jobs by highest match score
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.json(jobsWithScores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const existingApplication = await Application.findOne({
      jobId: job._id,
      candidateId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Generate dynamic mock match score for this application based on hash
    const hashStr = req.user._id.toString() + job._id.toString();
    let hash = 0;
    for (let i = 0; i < hashStr.length; i++) {
      hash = ((hash << 5) - hash) + hashStr.charCodeAt(i);
      hash = hash & hash;
    }
    const pseudoRandom = Math.abs(hash) % 34;
    const matchScore = 65 + pseudoRandom;

    const application = await Application.create({
      jobId: job._id,
      candidateId: req.user._id,
      recruiterId: job.recruiterId,
      matchScore,
      atsScore: Math.min(100, matchScore + 5),
      status: 'Pending',
      matchedKeywords: job.skills.slice(0, Math.max(1, job.skills.length - 1)),
      missingKeywords: job.skills.slice(Math.max(1, job.skills.length - 1)),
      skillsList: job.skills.map((skill, index) => ({
        skill,
        jd_req: index === 0 ? 'Required' : 'Preferred',
        percent: Math.min(100, matchScore + (index * 5))
      }))
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const { generateJDRefinements } = require('../utils/geminiService');

// ... other controllers ...

const getJobInsights = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ jobId: job._id });
    const total = applications.length;

    if (total < 3) {
      return res.json({ 
        activated: false, 
        message: 'Insights will appear once 3 or more candidates have applied.',
        total
      });
    }

    // 1. Pool Overview
    const avgScore = Math.round(applications.reduce((acc, app) => acc + app.matchScore, 0) / total);
    const strongFits = applications.filter(app => app.matchScore >= 75).length;
    const weakFits = applications.filter(app => app.matchScore < 50).length;

    // 2. Top Skills
    const skillCounts = {};
    applications.forEach(app => {
      (app.matchedKeywords || []).forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count, percent: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 3. Missing Skills
    const missingCounts = {};
    applications.forEach(app => {
      (app.missingKeywords || []).forEach(skill => {
        missingCounts[skill] = (missingCounts[skill] || 0) + 1;
      });
    });
    const missingSkills = Object.entries(missingCounts)
      .map(([name, count]) => {
        const percent = Math.round((count / total) * 100);
        let severity = 'Occasional';
        if (percent > 70) severity = 'Critical';
        else if (percent > 40) severity = 'Common';
        return { name, count, percent, severity };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 4. Score Distribution
    const distribution = [
      { range: '0-14', count: 0 },
      { range: '15-29', count: 0 },
      { range: '30-44', count: 0 },
      { range: '45-59', count: 0 },
      { range: '60-74', count: 0 },
      { range: '75-89', count: 0 },
      { range: '90-100', count: 0 },
    ];

    applications.forEach(app => {
      const score = app.matchScore;
      if (score < 15) distribution[0].count++;
      else if (score < 30) distribution[1].count++;
      else if (score < 45) distribution[2].count++;
      else if (score < 60) distribution[3].count++;
      else if (score < 75) distribution[4].count++;
      else if (score < 90) distribution[5].count++;
      else distribution[6].count++;
    });

    // 5. Suggestions
    const suggestions = await generateJDRefinements(job.title, job.description, {
      total,
      avgScore,
      topSkills: topSkills.map(s => s.name),
      missingSkills: missingSkills.map(s => s.name)
    });

    let poolNote = null;
    if (avgScore > 85) poolNote = "Strong applicant pool — consider raising the bar on preferred qualifications.";
    else if (avgScore < 35) poolNote = "Low pool quality — the JD may be too restrictive. See suggestions below.";

    res.json({
      activated: true,
      metrics: {
        total,
        avgScore,
        strongFits: { count: strongFits, percent: Math.round((strongFits / total) * 100) },
        weakFits: { count: weakFits, percent: Math.round((weakFits / total) * 100) }
      },
      topSkills,
      missingSkills,
      distribution,
      suggestions,
      poolNote,
      hasStructuredSkills: job.skills && job.skills.length > 0
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  getRecommendedJobs,
  applyForJob,
  getJobInsights
};

