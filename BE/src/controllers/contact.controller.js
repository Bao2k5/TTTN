const { sendMail } = require('../utils/mailer');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin (Tên, Email, Tin nhắn)' });
        }

        // Email content
        const subject = `[Liên hệ mới] Tin nhắn từ ${name}`;
        const htmlContent = `
      <h3>Có tin nhắn liên hệ mới từ website:</h3>
      <ul>
        <li><strong>Họ tên:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>SĐT:</strong> ${phone || 'Không cung cấp'}</li>
      </ul>
      <p><strong>Nội dung tin nhắn:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
        ${message.replace(/\n/g, '<br>')}
      </blockquote>
    `;

        // Send email to Admin
        await sendMail({
            to: 'leduongbao2019@gmail.com', // Admin email requested by user
            subject: subject,
            html: htmlContent
        });

        res.status(200).json({ message: 'Gửi tin nhắn thành công!' });

    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ error: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.' });
    }
};
