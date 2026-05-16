const Usage = require('../models/Usage');
const Subscription = require('../models/Subscription');

const checkFeatureLimit = (feature) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id;

      // Check if user has an active subscription
      const subscription = await Subscription.findOne({ userId, status: 'active' });
      
      // If no subscription and it's not a free feature, block?
      // Actually, everyone starts with Free limits.
      
      const usage = await Usage.findOne({ userId, feature });

      if (!usage) {
        // If no usage record, they probably haven't used it yet.
        // We should initialize it based on their plan.
        return next();
      }

      if (usage.count >= usage.limit) {
        return res.status(403).json({
          success: false,
          message: `You have reached your ${feature.replace('_', ' ')} limit for this month. Please upgrade your plan.`,
          limitReached: true
        });
      }

      next();
    } catch (error) {
      console.error('Feature Limit Middleware Error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
};

const incrementUsage = async (userId, feature) => {
  try {
    await Usage.findOneAndUpdate(
      { userId, feature },
      { $inc: { count: 1 } }
    );
  } catch (error) {
    console.error('Increment Usage Error:', error);
  }
};

module.exports = { checkFeatureLimit, incrementUsage };
