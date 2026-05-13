const contactEmailTemplate = ({ name, email, subject, message }) => {
  return {
    subject: `📬 New Message: ${subject}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 10px 40px rgba(99, 102, 241, 0.1);">
          
          <!-- Header Gradient Section -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);padding:48px 40px;text-align:center;">
              <div style="background-color:rgba(255,255,255,0.1);display:inline-block;padding:12px;border-radius:16px;margin-bottom:20px;">
                <span style="font-size:32px;">📬</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                New Inquiry Received
              </h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:16px;font-weight:500;">
                A new message has arrived from SkillFusion
              </p>
            </td>
          </tr>

          <!-- Dynamic Content -->
          <tr>
            <td style="padding:48px 40px;">
              
              <!-- Sender Profile Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;border-radius:20px;margin-bottom:32px;">
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50" style="vertical-align:top;">
                          <div style="width:40px;height:40px;background-color:#4f46e5;border-radius:12px;text-align:center;line-height:40px;color:#ffffff;font-weight:bold;font-size:18px;">
                            ${name.charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td>
                          <p style="margin:0;font-size:14px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Sent By</p>
                          <p style="margin:4px 0 0;font-size:18px;color:#0f172a;font-weight:700;">${name}</p>
                          <p style="margin:4px 0 0;font-size:15px;color:#4f46e5;font-weight:500;">${email}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Section -->
              <div style="margin-bottom:32px;">
                <p style="margin:0 0 8px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Subject Line</p>
                <p style="margin:0;font-size:20px;font-weight:800;color:#1e293b;">${subject}</p>
              </div>

              <div style="background-color:#ffffff;border:2px solid #f1f5f9;border-radius:20px;padding:32px;margin-bottom:40px;">
                <p style="margin:0 0 12px;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Message Content</p>
                <p style="margin:0;font-size:16px;color:#334155;line-height:1.8;white-space:pre-wrap;">${message}</p>
              </div>

              <!-- Quick Action -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${subject}" 
                       style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:18px 48px;border-radius:16px;font-size:16px;font-weight:700;box-shadow:0 10px 15px -3px rgba(79, 70, 229, 0.3);">
                      Respond to Message
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer with modern touch -->
          <tr>
            <td style="padding:0 40px 48px;text-align:center;">
              <div style="height:1px;background-color:#f1f5f9;margin-bottom:32px;"></div>
              <p style="margin:0;font-size:14px;color:#94a3b8;font-weight:500;">
                Received on ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
              <p style="margin:16px 0 0;font-size:16px;color:#4f46e5;font-weight:800;">
                SkillFusion
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#cbd5e1;">
                Automated notification from your SkillFusion contact portal.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
  };
};

const forgotPasswordTemplate = (resetUrl) => {
  return {
    subject: '🔒 Reset Your SkillFusion Password',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:32px;overflow:hidden;box-shadow:0 20px 50px rgba(79, 70, 229, 0.1);">
          
          <!-- Animated-style Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);padding:60px 40px;text-align:center;">
              <div style="background-color:rgba(255,255,255,0.1);display:inline-block;padding:16px;border-radius:24px;margin-bottom:24px;">
                <span style="font-size:40px;">🔐</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;letter-spacing:-1px;">
                SkillFusion
              </h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.9);font-size:18px;font-weight:500;">
                Secure Password Reset
              </p>
            </td>
          </tr>

          <!-- Security Content -->
          <tr>
            <td style="padding:60px 50px;">
              <h2 style="margin:0 0 20px;color:#0f172a;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                Reset your password?
              </h2>
              <p style="margin:0 0 32px;color:#475569;font-size:17px;line-height:1.7;">
                We received a request to reset the password for your SkillFusion account. No worries, it happens to the best of us! Click the secure link below to proceed.
              </p>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" 
                       style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;padding:20px 52px;border-radius:20px;font-size:18px;font-weight:700;box-shadow:0 15px 30px -5px rgba(79, 70, 229, 0.4);transition: all 0.3s ease;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Safety Banner -->
              <div style="background-color:#fff1f2;border-radius:20px;padding:24px;border:1px solid #fecdd3;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="40" style="vertical-align:top;">
                      <span style="font-size:20px;">🛡️</span>
                    </td>
                    <td>
                      <p style="margin:0;font-size:14px;color:#991b1b;font-weight:700;margin-bottom:4px;">Security Notice</p>
                      <p style="margin:0;font-size:14px;color:#e11d48;line-height:1.5;">
                        This link will expire in <strong>10 minutes</strong>. If you didn't request this, please ignore this email and your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

            </td>
          </tr>

          <!-- Modern Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:48px 50px;text-align:center;">
              <p style="margin:0;font-size:14px;color:#94a3b8;font-weight:500;">
                &copy; ${new Date().getFullYear()} SkillFusion AI Platform.
              </p>
              <div style="margin-top:16px;">
                <a href="#" style="color:#64748b;text-decoration:none;font-size:12px;margin:0 10px;">Privacy Policy</a>
                <a href="#" style="color:#64748b;text-decoration:none;font-size:12px;margin:0 10px;">Terms of Service</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
  };
};

module.exports = { contactEmailTemplate, forgotPasswordTemplate };