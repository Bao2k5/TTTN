// src/utils/email.js
const nodemailer = require('nodemailer');

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body
 */
async function sendEmail({ to, subject, text, html }) {
    try {
        // Create transporter (using environment variables or defaults)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send mail
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"HM Jewelry" <noreply@hmjewelry.com>',
            to,
            subject,
            text,
            html,
        });

        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Email send error:', error);
        // Don't throw error - just log it so order creation doesn't fail
        return null;
    }
}

module.exports = sendEmail;
