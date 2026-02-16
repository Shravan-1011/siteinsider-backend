const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});


const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"SiteInsider" <${process.env.EMAIL_USER}>`,
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
