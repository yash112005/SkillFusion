import Razorpay from 'razorpay';
import crypto from 'crypto';
import User from '../models/User.js';

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body; 

    let amount;
    if (plan === 'Pro') {
      amount = 29900;
    } else if (plan === 'Enterprise') {
      amount = 99900;
    } else {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const instance = getRazorpayInstance();

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_order_${req.user._id.toString().substring(0, 10)}`,
      notes: {
        userId: req.user._id.toString(),
        plan: plan,
      }
    };

    const order = await instance.orders.create(options);

    res.json({ 
      orderId: order.id, 
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const shasum = crypto.createHmac('sha256', webhookSecret);
    const bodyStr = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);
    shasum.update(bodyStr);
    const digest = shasum.digest('hex');

    if (digest !== webhookSignature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const event = JSON.parse(bodyStr);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment.entity;
      const notes = paymentEntity.notes;

      if (notes && notes.userId) {
        const userId = notes.userId;
        const plan = notes.plan || 'Pro';

        const user = await User.findById(userId);
        if (user) {
          user.subscriptionPlan = plan; 
          await user.save();
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send(`Webhook Error: ${error.message}`);
  }
};
