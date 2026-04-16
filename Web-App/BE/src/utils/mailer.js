const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Cấu hình SendGrid API Key (Bypass Render SMTP Block & Gửi cho mọi user)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  if (host && host.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 10000, 
      greetingTimeout: 10000, 
      socketTimeout: 15000
    });
  }

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

  // 1. Ưu tiên dùng SendGrid HTTP API (Vượt tường Render, bắn OTP cho mọi người)
  if (process.env.SENDGRID_API_KEY) {
    try {
      console.log('[MAILER] Using SendGrid HTTP API...');
      const msg = {
        to: to,
        from: 'HM Jewelry <leduongbao2019@gmail.com>', // Bat buoc phai match Sender Identity cua SendGrid
        subject: subject,
        text: text || 'HM Jewelry Notification',
        html: html,
      };

      const [response] = await sgMail.send(msg);
      console.log('[MAILER-SENDGRID] Email sent successfully! Status:', response.statusCode);
      return response;
    } catch (error) {
      console.error('[MAILER-SENDGRID] Sending failed:', error.response ? error.response.body : error.message);
      return { error: error.message };
    }
  }

  // 2. Chạy phòng hờ bằng Nodemailer nếu chạy Local không có API Key SendGrid
  console.log('[MAILER] Falling back to standard SMTP / Nodemailer...');
  const transporter = createTransport();
  if (!transporter) {
    console.error('[MAILER] Neither SendGrid nor Nodemailer configured.');
    return { error: 'SMTP/Mailer not configured' };
  }
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
      text
    });
    console.log('[MAILER-SMTP] Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('[MAILER-SMTP] Sending failed:', error.message);
    return { error: error.message };
  }
}

module.exports = { sendMail };
