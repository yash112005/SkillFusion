const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  level: { type: String, required: true },
  type: { type: String, required: true },
  questions: [{
    question: String,
    answer: String,
    score: String, // 'great' | 'good' | 'needs improvement'
    feedback: String,
    confidence: Number
  }],
  overallScore: { type: Number },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' }
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
