const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  matchedSkills: [{
    skill: String,
    jd_req: String,
    percent: Number
  }],
  suggestions: { type: String },
  atsScore: { type: Number, default: 0 },
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
