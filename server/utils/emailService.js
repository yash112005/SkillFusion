const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, replyTo }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'SkillFusion <onboarding@resend.dev>', // Default Resend testing email
      to: [to],
      subject: subject,
      html: html,
      reply_to: replyTo
    });

    if (error) {
      console.error('Resend Error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Email Service Error:', error);
    throw error;
  }
};

module.exports = { sendEmail };
