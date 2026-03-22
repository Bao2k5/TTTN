// src/utils/mailer.js
const nodemailer = require('nodemailer');

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  // Neu la Gmail thi dung service: 'gmail' cho on dinh nhat
  if (host && host.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 10000, // 10s
      greetingTimeout: 10000, 
      socketTimeout: 15000
    });
  }

  // Fallback cho cac serve khac
  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10) || 587,
    secure: port == 465,
    auth: { user, pass },
    connectionTimeout: 10000
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
    return { error: error.message }; // Return error object instead of null
  }
}

module.exports = { sendMail };
