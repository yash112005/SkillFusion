const Contact = require('../models/contact');
const nodemailer = require('nodemailer');
const contactEmailTemplate = require('../utils/templateemail');

const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const { subject: emailSubject, html } = contactEmailTemplate({ name, email, subject, message });

    await transporter.sendMail({
      from: `"SkillFusion Contact" <${process.env.EMAIL_USER}>`,
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