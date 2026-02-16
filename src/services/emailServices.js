const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    await resend.emails.send({
      from: "SiteInsider <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", subject);
  } catch (error) {
    console.error("EMAIL ERROR:", error);
  }
};

module.exports = sendEmail;
