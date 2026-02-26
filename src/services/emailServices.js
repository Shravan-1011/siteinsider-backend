const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: "SiteInsider <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    console.log("📨 Resend full response:", response);

    if (response.error) {
      console.error("❌ Resend returned error:", response.error);
    } else {
      console.log("✅ Email accepted by Resend:", response.id);
    }

  } catch (error) {
    console.error("💥 EMAIL THROW ERROR:", error);
  }
};

module.exports = sendEmail;