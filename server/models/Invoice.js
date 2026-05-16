const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  date: {
    type: Date,
    default: Date.now
  },
  pdfUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'void'],
    default: 'paid'
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
