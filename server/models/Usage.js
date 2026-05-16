const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feature: {
    type: String,
    required: true,
    enum: ['ai_matches', 'resume_scans', 'portfolio_builds', 'mock_interviews']
  },
  count: {
    type: Number,
    default: 0
  },
  limit: {
    type: Number,
    required: true
  },
  resetDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Compound index for efficient querying
usageSchema.index({ userId: 1, feature: 1 }, { unique: true });

module.exports = mongoose.model('Usage', usageSchema);
