const Bravo = require("@getbrevo/brevo");
const apiInstance = new Bravo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Bravo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

exports.sendEmail = async (toEmail, code) => {
  try {
    const sendSmtpEmail = {
      sender: {
        name: "Courses",
        email: "mohamedelsefi11@gmail.com",
      },
      to: [{ email: toEmail }],
      subject: "Email Verification Code",
      htmlContent: `
        <h2>Your Verification Code</h2>
        <p>Your verification code is:</p>
        <h3>${code}</h3>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully:");
  } catch (error) {
    console.log("Error sending email:", error);
  }
};

exports.sendResetPasswordEmail = async (toEmail, resetURL) => {
  try {
    const sendSmtpEmail = {
      sender: {
        name: "Courses",
        email: "mohamedelsefi11@gmail.com",
      },
      to: [{ email: toEmail }],
      subject: "Reset Your Password",
      htmlContent: `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetURL}" 
           style="display:inline-block; padding:10px 15px; background:#4CAF50; color:white; text-decoration:none; border-radius:5px;">
           Reset Password
        </a>
        <br><br>
        <p>This link will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not request this, simply ignore this email.</p>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.log("Error sending reset password email:", error);
  }
};


exports.sendReplyEmail = async (toEmail, replyMessage) => {
  try {
    const htmlContent = `
      <h2>Response from Courses Support</h2>

      <p>Hello,</p>

      <p>We have received your message and here is our reply:</p>

      <div style="padding: 12px; background: #f4f4f4; border-left: 4px solid #4CAF50; margin: 10px 0;">
        <p style="font-size: 16px; color: #333;"><strong>Reply:</strong></p>
        <p style="font-size: 15px; color: #555;">${replyMessage}</p>
      </div>

      <p>If you have any further questions, feel free to reply to this email.</p>

      <p>Best regards,<br>
      <strong>Courses Support Team</strong></p>
    `;

    await apiInstance.sendTransacEmail({
      sender: {
        name: "Courses",
        email: "mohamedelsefi11@gmail.com",
      },
      to: [{ email: toEmail }],
      subject: "Response to Your Message",
      htmlContent,
    });

    console.log("Reply email sent successfully");
  } catch (error) {
    console.log("Error sending reply email:", error);
  }
};
