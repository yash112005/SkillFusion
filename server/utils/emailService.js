const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Initialize Nodemailer transporter as fallback
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Generic send email function using Resend with Nodemailer fallback
 */
const sendEmail = async ({ to, subject, html }) => {
  // 1. Try Resend first
  if (resend) {
    try {
      console.log(`Attempting to send email via Resend to ${to}...`);
      const { data, error } = await resend.emails.send({
        from: 'SkillFusion <onboarding@resend.dev>', // Note: only works for registered email in free tier
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.warn('Resend API returned an error:', error.message);
        console.log('Falling back to Nodemailer (Gmail)...');
      } else {
        console.log('Email sent successfully via Resend:', data.id);
        return data;
      }
    } catch (resendError) {
      console.warn('Resend SDK thrown an error:', resendError.message);
      console.log('Falling back to Nodemailer (Gmail)...');
    }
  } else {
    console.warn('Resend API key is missing. Falling back to Nodemailer (Gmail)...');
  }

  // 2. Fallback to Nodemailer
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Nodemailer configuration (EMAIL_USER / EMAIL_PASS) is missing.');
    }

    console.log(`Attempting to send email via Nodemailer (Gmail) to ${to}...`);
    const mailOptions = {
      from: `"SkillFusion" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via Nodemailer:', info.messageId);
    return { id: info.messageId, provider: 'nodemailer' };
  } catch (nodemailerError) {
    console.error('Email Service Error (both Resend and Nodemailer failed):', nodemailerError);
    throw nodemailerError;
  }
};

/**
 * Specialized payment success email
 */
const sendPaymentEmail = async (user, payment, plan) => {
  try {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6366f1;">Payment Successful!</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for upgrading to the <strong>${plan}</strong> plan on SkillFusion. Your payment was successful and your account has been upgraded.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${payment.orderId}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${payment.amount}</p>
          <p style="margin: 5px 0;"><strong>Plan:</strong> ${plan}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <p>You can now access all the premium features included in your plan. Head over to your dashboard to get started!</p>
        
        <a href="${process.env.FRONTEND_URL || 'https://skillfusion.ai'}/dashboard" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
        
        <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
          If you have any questions, feel free to reply to this email or contact our support team.
          <br>
          © 2026 SkillFusion. All rights reserved.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: `Payment Successful - Welcome to ${plan} Plan!`,
      html
    });
    
    console.log('Payment success email sent to:', user.email);
  } catch (error) {
    console.error('Email Service Error (sendPaymentEmail):', error);
  }
};

module.exports = { sendEmail, sendPaymentEmail };
