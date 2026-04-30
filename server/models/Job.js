const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  company: { 
    type: String, 
    required: true,
    trim: true
  },
  location: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String, 
    enum: ['Full-time', 'Part-time', 'Internship', 'Remote'],
    required: true 
  },
  skills: [{ 
    type: String,
    trim: true
  }],
  experience: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  description: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
