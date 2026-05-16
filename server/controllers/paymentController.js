const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const Usage = require('../models/Usage');
const { PLANS } = require('../utils/billingConstants');
const { generateInvoice } = require('../utils/invoiceGenerator');
const { sendPaymentEmail } = require('../utils/emailService');



const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { plan, interval = 'month' } = req.body;
    const planKey = plan.toUpperCase();
    
    if (!PLANS[planKey]) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const amount = PLANS[planKey].price * 100; // Amount in paise

    const instance = getRazorpayInstance();
    const options = {
      amount,
      currency: "INR",
      receipt: `rcpt_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan: plan,
        interval: interval
      }
    };

    const order = await instance.orders.create(options);

    // Save initial payment record
    await Payment.create({
      userId: req.user._id,
      orderId: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      status: 'created',
      notes: options.notes
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (!isSignatureValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Update Payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { 
        paymentId: razorpay_payment_id, 
        signature: razorpay_signature,
        status: 'captured'
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const plan = payment.notes.get('plan');
    const interval = payment.notes.get('interval') || 'month';

    // Update User Plan
    const user = await User.findById(payment.userId);
    user.subscriptionPlan = plan;
    user.isPro = plan !== 'Free';
    await user.save();

    // Create or Update Subscription
    const endDate = new Date();
    if (interval === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    await Subscription.findOneAndUpdate(
      { userId: user._id },
      {
        plan,
        status: 'active',
        startDate: new Date(),
        endDate,
        lastPaymentDate: new Date()
      },
      { upsert: true, new: true }
    );

    // Initialize/Reset Usage Limits
    const planLimits = PLANS[plan.toUpperCase()].limits;
    for (const [feature, limit] of Object.entries(planLimits)) {
      await Usage.findOneAndUpdate(
        { userId: user._id, feature },
        { limit, count: 0, resetDate: endDate },
        { upsert: true }
      );
    }
    
    // Generate Invoice
    await generateInvoice(payment);
    
    // Send Notification Email
    await sendPaymentEmail(user, payment, plan);

    res.json({ success: true, message: 'Payment verified successfully' });


  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Handle Razorpay Webhook
// @route   POST /api/payment/webhook
// @access  Public
exports.handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const shasum = crypto.createHmac('sha256', webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== signature) {
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  try {
    switch (event) {
      case 'payment.captured':
        // Handle captured payment if not already handled by verify API
        const paymentId = payload.payment.entity.id;
        const orderId = payload.payment.entity.order_id;
        await Payment.findOneAndUpdate(
          { orderId },
          { paymentId, status: 'captured' }
        );
        break;

      case 'payment.failed':
        const failedOrderId = payload.payment.entity.order_id;
        await Payment.findOneAndUpdate(
          { orderId: failedOrderId },
          { status: 'failed', error_description: payload.payment.entity.error_description }
        );
        break;

      case 'subscription.cancelled':
        // Handle subscription cancellation
        const subId = payload.subscription.entity.id;
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subId },
          { status: 'cancelled' }
        );
        break;

      default:
        console.log('Unhandled event:', event);
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

// @desc    Get Billing Info for Dashboard
// @route   GET /api/payment/billing-info
// @access  Private
exports.getBillingInfo = async (req, res) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ userId });
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 }).limit(10);
    const usage = await Usage.find({ userId });

    res.json({
      success: true,
      subscription,
      payments,
      usage,
      plans: PLANS
    });
  } catch (error) {
    console.error('Get Billing Info Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Invoices
// @route   GET /api/payment/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const Invoice = require('../models/Invoice');
    const invoices = await Invoice.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin Billing Analytics
// @route   GET /api/payment/admin/analytics
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    
    const recentPayments = await Payment.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: { 
          status: 'captured',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        } 
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      totalRevenue: totalRevenue[0]?.total || 0,
      activeSubscriptions,
      recentPayments,
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Apply Coupon Code
// @route   POST /api/payment/apply-coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const Coupon = require('../models/Coupon');
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }
    
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' });
    }
    
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }
    
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (amount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }
    
    const finalAmount = Math.max(amount - discount, 0);
    
    res.json({
      success: true,
      discount,
      finalAmount,
      message: `Coupon applied: ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} off`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




