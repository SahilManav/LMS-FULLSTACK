// server/utils/sendEmail.js
import nodemailer from "nodemailer";

// 🔍 TEMP DEBUG LOG (IMPORTANT)
console.log(
  "EMAIL ENV CHECK →",
  process.env.EMAIL_USER,
  process.env.EMAIL_PASS ? "PASS_OK" : "PASS_MISSING"
);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Edemy" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};
