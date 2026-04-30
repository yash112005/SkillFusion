const mongoose = require('mongoose');

const jdSchema = new mongoose.Schema({
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
}, { timestamps: true });

const JD = mongoose.model('JD', jdSchema);
module.exports = JD;
