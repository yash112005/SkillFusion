const Resume = require('../models/Resume');
const { generateResumeContent } = require('../utils/geminiService');
const templatesData = require('../utils/templatesData');

exports.getTemplates = (req, res) => {
  res.status(200).json(templatesData);
};

exports.saveResume = async (req, res) => {
  try {
    const userId = req.user._id;
    const { 
      personalInfo, 
      summary, 
      experience, 
      education, 
      skills, 
      projects, 
      selectedTemplate,
      customOverrides
    } = req.body;

    let resume = await Resume.findOne({ userId });

    if (resume) {
      resume.personalInfo = personalInfo || resume.personalInfo;
      resume.summary = summary !== undefined ? summary : resume.summary;
      resume.experience = experience || resume.experience;
      resume.education = education || resume.education;
      resume.skills = skills || resume.skills;
      resume.projects = projects || resume.projects;
      resume.selectedTemplate = selectedTemplate || resume.selectedTemplate;
      resume.customOverrides = customOverrides || resume.customOverrides;
      
      await resume.save();
      return res.status(200).json(resume);
    } else {
      resume = new Resume({
        userId,
        personalInfo,
        summary,
        experience,
        education,
        skills,
        projects,
        selectedTemplate,
        customOverrides
      });

      await resume.save();
      return res.status(201).json(resume);
    }
  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({ message: 'Failed to save resume' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }
    res.status(200).json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
};

exports.generateAiContent = async (req, res) => {
  try {
    const { promptType, data, jobDescription } = req.body;
    // promptType can be 'summary', 'bullets', 'skills', 'optimize'
    
    if (!promptType || !data) {
      return res.status(400).json({ message: 'Missing promptType or data' });
    }

    const aiResult = await generateResumeContent(promptType, data, jobDescription);
    res.status(200).json({ result: aiResult });
  } catch (error) {
    console.error('Error generating AI content:', error);
    res.status(500).json({ message: 'Failed to generate AI content' });
  }
};
