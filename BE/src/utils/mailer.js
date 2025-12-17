// src/utils/mailer.js
const nodemailer = require('nodemailer');

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: port == 465,
    auth: { user, pass }
  });
}

async function sendMail({ to, subject, html, text }) {
  const transporter = createTransport();
  if (!transporter) {
    // SMTP not configured: caller should handle fallback
    return null;
  }
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text
  });
  return info;
}

module.exports = { sendMail };
