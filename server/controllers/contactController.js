const Contact = require('../models/contact');
const { sendEmail } = require('../utils/emailService');
const { contactEmailTemplate } = require('../utils/templateemail');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    const { subject: emailSubject, html } = contactEmailTemplate({ name, email, subject, message });

    await sendEmail({
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: emailSubject,
      html
    });

    res.status(201).json({ success: true, msg: 'Message sent successfully!' });
  } catch (err) {
    console.error('Contact form error:', err.message);
    res.status(500).json({ success: false, msg: 'Error processing contact form', error: err.message });
  }
};

module.exports = { submitContactForm };