const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  jobTitle: { type: String, default: '' },
  company: { type: String, default: '' },
  summary: { type: String, default: '' },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  matchedSkills: [{
    skill: String,
    jd_req: String,
    percent: Number
  }],
  suggestions: { type: String },
  atsScore: { type: Number, default: 0 },
  jdAnalysis: {
    skills: {
      hard: [String],
      soft: [String]
    },
    responsibilities: [String],
    cultureFit: [String],
    atsKeywords: [String]
  }
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
