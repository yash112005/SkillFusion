const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  summary: {
    type: String,
    default: ''
  },
  experience: [{
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' }
  }],
  education: [{
    degree: { type: String, default: '' },
    school: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    gpa: { type: String, default: '' }
  }],
  skills: [{
    type: String
  }],
  projects: [{
    name: { type: String, default: '' },
    description: { type: String, default: '' },
    link: { type: String, default: '' }
  }],
  selectedTemplate: {
    type: String,
    default: 'classic'
  },
  customOverrides: {
    font: { type: String, default: 'Arial, sans-serif' },
    color: { type: String, default: '#000000' },
    margins: { type: String, default: '1in' },
    visibleSections: [{ type: String }],
    sectionOrder: [{ type: String }]
  }
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
