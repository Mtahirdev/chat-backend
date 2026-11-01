import nodemailer from "nodemailer";
import config from "../config/config.js";
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.googleUser, // Still use the full Gmail address
    pass: config.smtpPass, // Change to app password read from environment variable
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error connecting to email service:", error);
  } else {
    console.log("Email service connected successfully.");
  }
});

export const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `Muhammad Tahir Pansota <${config.googleUser}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent: ", info.response);
    console.log("Preview URL: ", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log("Error sending email: ", error);
  }
};
export default transporter;

// mongodb+srv://tahir:tahir@cluster0.onk62gi.mongodb.net/
