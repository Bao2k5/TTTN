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
  console.log(`[MAILER] Preparing to send email to: ${to}`);
  const transporter = createTransport();
  if (!transporter) {
    console.error('[MAILER] SMTP not configured. Missing env variables.');
    return null;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text
    });
    console.log('[MAILER] Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('[MAILER] Sending failed:', error.message);
    return null;
  }
}

module.exports = { sendMail };
