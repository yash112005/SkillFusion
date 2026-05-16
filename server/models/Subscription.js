const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'past_due', 'trialing'],
    default: 'inactive'
  },
  razorpaySubscriptionId: {
    type: String,
    sparse: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  lastPaymentDate: {
    type: Date
  },
  nextBillingDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
