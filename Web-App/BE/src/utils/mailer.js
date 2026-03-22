const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// Khởi tạo Resend SDK nếu có Key (Bypass SMTP block)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

  // 1. Ưu tiên dùng Resend (Mượt, HTTP API, không bị khóa cổng trên Render)
  if (resend) {
    try {
      console.log('[MAILER] Using Resend HTTP API...');
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'HM Jewelry <onboarding@resend.dev>', // Bắt buộc dùng onboarding@resend.dev nếu chưa Verify Domain trên Resend
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
        text: text || ''
      });

      if (error) {
         console.error('[MAILER-RESEND] Sending failed:', error);
         return { error: error.message };
      }

      console.log('[MAILER-RESEND] Email sent successfully:', data?.id);
      return data;
    } catch (err) {
      console.error('[MAILER-RESEND] Exception:', err.message);
      return { error: err.message };
    }
  }

  // 2. Chạy phòng hờ bằng Nodemailer nếu không có Key Resend
  console.log('[MAILER] Falling back to standard SMTP / Nodemailer...');
  const transporter = createTransport();
  if (!transporter) {
    console.error('[MAILER] SMTP not configured. Missing env variables.');
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
