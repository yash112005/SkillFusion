const Feedback = require('../models/Feedback');

const submitFeedback = async (req, res) => {
  try {
    const { rating, comment, category } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required' });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      rating,
      comment,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback
    });
  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitFeedback, getAllFeedback };
