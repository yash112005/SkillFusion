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
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.5px;">
                📬 New Contact Message
              </h1>
              <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">
                Someone reached out via SkillFusion
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="background-color:#ede9fe;padding:14px 40px;text-align:center;">
              <p style="margin:0;color:#6d28d9;font-size:14px;font-weight:600;">
                ⚡ You have a new message waiting for your response
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">

              <!-- Sender Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f7ff;border-radius:10px;border:1px solid #ede9fe;margin-bottom:28px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;font-weight:700;">Sender Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #ede9fe;">
                          <span style="font-size:13px;color:#6b7280;width:80px;display:inline-block;">👤 Name</span>
                          <span style="font-size:15px;color:#1f2937;font-weight:600;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="font-size:13px;color:#6b7280;width:80px;display:inline-block;">📧 Email</span>
                          <a href="mailto:${email}" style="font-size:15px;color:#6366f1;font-weight:600;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Subject -->
              <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;font-weight:700;">Subject</p>
              <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#1f2937;">${subject}</p>

              <!-- Message -->
              <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;font-weight:700;">Message</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#f9fafb;border-left:4px solid #6366f1;border-radius:0 8px 8px 0;padding:20px 24px;">
                    <p style="margin:0;font-size:15px;color:#374151;line-height:1.8;">${message}</p>
                  </td>
                </tr>
              </table>

              <!-- Reply Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${email}?subject=Re: ${subject}" 
                       style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                      ↩️ Reply to ${name}
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Timestamp -->
          <tr>
            <td style="padding:0 40px 20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Received on ${new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f7ff;border-top:1px solid #ede9fe;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#6366f1;">SkillFusion</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">This email was sent from your SkillFusion contact form.</p>
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

module.exports = contactEmailTemplate;