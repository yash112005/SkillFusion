const mongoose = require('mongoose');

const matchFeedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  feedback: { 
    type: String, 
    enum: ['positive', 'negative'], 
    required: true 
  },
}, { timestamps: true });

matchFeedbackSchema.index({ userId: 1, matchId: 1 }, { unique: true });

const MatchFeedback = mongoose.model('MatchFeedback', matchFeedbackSchema);
module.exports = MatchFeedback;
