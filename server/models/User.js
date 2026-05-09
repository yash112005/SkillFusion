const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'apple'],
    default: 'local'
  },
  googleId: { type: String, sparse: true, unique: true },
  appleId: { type: String, sparse: true, unique: true },
  role: { 
    type: String, 
    enum: ['candidate', 'recruiter', 'admin'], 
    default: 'candidate' 
  },
  subscriptionPlan: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free'
  },
  stripeCustomerId: { type: String },
  usage_count: { type: Number, default: 0 },
  usageResetDate: { type: Date, default: Date.now },
  isPro: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
