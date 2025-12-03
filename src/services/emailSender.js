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
