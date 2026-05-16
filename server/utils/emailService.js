const nodemailer = require('nodemailer');

const sendPaymentEmail = async (user, payment, plan) => {
  try {
    // Create a transporter (using a mock/test account or environment variables)
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use process.env.EMAIL_SERVICE
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"SkillFusion Billing" <no-reply@skillfusion.ai>',
      to: user.email,
      subject: `Payment Successful - Welcome to ${plan} Plan!`,
      html: `
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
          
          <a href="https://skillfusion.ai/dashboard" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Go to Dashboard</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
            If you have any questions, feel free to reply to this email or contact our support team.
            <br>
            © 2026 SkillFusion. All rights reserved.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Payment success email sent to:', user.email);
  } catch (error) {
    console.error('Email Service Error:', error);
  }
};

module.exports = { sendPaymentEmail };
