const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchScore: { type: Number, required: true },
  atsScore: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Interview', 'Rejected'], default: 'Pending' },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  skillsList: [{ skill: String, jd_req: String, percent: Number }],
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
