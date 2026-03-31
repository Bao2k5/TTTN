// src/controllers/auth.controller.js
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const { sendMail } = require('../utils/mailer');

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!email || !password || !name) return res.status(400).json({ msg: "Missing fields" });

    const existing = await User.findOne({ email });

    // Nếu email đã tồn tại VÀ đã xác thực -> Báo lỗi luôn
    if (existing && existing.verified) {
      return res.status(400).json({ msg: "Email already registered" });
    }

    // Nếu email tồn tại NHƯNG chưa xác thực -> Xóa user cũ đi để đăng ký lại từ đầu
    if (existing && !existing.verified) {
      await User.findByIdAndDelete(existing._id);
      console.log(`[register] Deleted unverified user: ${email}`);
    }

    // Tạo mã OTP 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Gửi email chứa OTP TRƯỚC (Fail-Fast)
    console.log('[AUTH] Registration: Sending OTP email to:', email);
    const mailResult = await sendMail({
      to: email,
      subject: "Mã xác thực đăng ký tài khoản",
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0b5c5f; text-align: center;">🎉 Chào mừng đến HM Jewelry!</h2>
        <p>Xin chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>HM Jewelry</strong>.</p>
        <p>Mã xác thực OTP của bạn là:</p>
        <div style="background-color: #f0f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #0b5c5f; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #d32f2f; font-weight: bold;"> Mã này có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">Trân trọng,<br><strong>Đội ngũ HM Jewelry</strong></p>
      </div>`
    });

    if (!mailResult || mailResult.error) {
      console.warn('[AUTH] OTP email failed to send:', mailResult?.error || 'Unknown error');
      return res.status(500).json({
        msg: "Hệ thống đang bảo trì dịch vụ Email. Không thể gửi mã OTP, vui lòng thử lại sau."
      });
    }
    
    console.log('[AUTH] Registration: Email sent successfully, creating user...');

    // CHỈ TẠO USER KHI MAIL ĐÃ BAY ĐI THÀNH CÔNG
    const newUser = await User.create({
      name,
      email,
      password: hashed,
      phone: phone || '',
      otp,
      otpExpire,
      verified: false
    });

    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP.",
      needsVerification: true,
      email
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('[auth.login] body:', req.body);
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Missing fields" });

    const user = await User.findOne({ email });
    console.log('[auth.login] user from DB:', user ? { email: user.email, id: user._id, role: user.role } : null);
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('[auth.login] bcrypt compare result:', isMatch);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    let token;
    try {
      token = signToken(user);
    } catch (jwtErr) {
      console.error('[auth.login] jwt.sign error:', jwtErr && jwtErr.stack ? jwtErr.stack : jwtErr);
      return res.status(500).json({ error: 'JWT error' });
    }
    res.json({
      message: "Login success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    console.error('[auth.login] error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email not found" });
    // Tạo token reset password ngẫu nhiên
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || ''}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;
    const html = `<p>Xin chào ${user.name},</p><p>Click link để đặt lại mật khẩu: <a href="${resetUrl}">${resetUrl}</a></p><p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`;
    const mailResult = await sendMail({ to: email, subject: 'Đặt lại mật khẩu', html, text: `Reset link: ${resetUrl}` });

    if (!mailResult || mailResult.error) {
       return res.status(500).json({ msg: "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.", error: mailResult?.error });
    }
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ msg: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid request' });
    if (user.resetPasswordToken !== token || Date.now() > user.resetPasswordExpires) return res.status(400).json({ msg: 'Token invalid or expired' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Email not found' });
    const token = crypto.randomBytes(16).toString('hex');
    user.verifyEmailToken = token;
    await user.save();
    const verifyUrl = `${process.env.FRONTEND_URL || ''}/verify-email?email=${encodeURIComponent(email)}&token=${token}`;
    const html = `<p>Xin chào ${user.name},</p><p>Click link để xác thực email: <a href="${verifyUrl}">${verifyUrl}</a></p>`;
    const mailResult = await sendMail({ to: email, subject: 'Xác thực email', html, text: `Verify link: ${verifyUrl}` });
    if (!mailResult || mailResult.error) {
       return res.status(500).json({ msg: 'Không thể gửi email xác thực', error: mailResult?.error });
    }
    res.json({ message: 'Verify email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid request' });
    if (user.verifyEmailToken !== token) return res.status(400).json({ msg: 'Invalid token' });
    user.emailVerified = true;
    user.verifyEmailToken = undefined;
    await user.save();
    res.json({ message: 'Email verified' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xử lý callback sau khi login Google/Facebook thành công
exports.googleCallback = async (req, res) => {
  try {
    const token = signToken(req.user);
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

exports.facebookCallback = async (req, res) => {
  try {
    const token = signToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};

// Đổi mật khẩu (cho user đã đăng nhập)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters' });
    }

    // Lấy user từ DB
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Kiểm tra mật khẩu cũ có đúng không
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Lưu vào DB
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Gửi OTP để reset password
exports.sendResetCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Email không tồn tại trong hệ thống" });

    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = otp;
    user.resetCodeExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Gửi email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0b5c5f; text-align: center;">🔐 Đặt lại mật khẩu</h2>
        <p>Xin chào <strong>${user.name || "bạn"}</strong>!</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản <strong>${email}</strong>.</p>
        <p>Mã xác thực OTP của bạn là:</p>
        <div style="background-color: #f0f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #0b5c5f; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #d32f2f; font-weight: bold;">⚠️ Mã này có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">Trân trọng,<br><strong>Đội ngũ HM Jewelry</strong></p>
      </div>
    `;

    const mailResult = await sendMail({
      to: email,
      subject: '🔐 Mã OTP đặt lại mật khẩu - HM Jewelry',
      html,
      text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong 10 phút.`
    });

    if (!mailResult || mailResult.error) {
      return res.status(500).json({
        msg: "Hệ thống đang bảo trì dịch vụ Email. Không thể gửi mã OTP đặt lại mật khẩu.",
        error: mailResult?.error
      });
    }

    res.json({ message: "Mã xác thực đã được gửi qua email của bạn" });
  } catch (err) {
    console.error('sendResetCode error:', err);
    res.status(500).json({ msg: "Lỗi khi gửi mã xác thực", error: err.message });
  }
};

// Xác thực OTP và đặt lại mật khẩu mới
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ msg: "Thiếu thông tin bắt buộc" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: "Mật khẩu mới phải có ít nhất 6 ký tự" });
    }

    const user = await User.findOne({ email, resetCode: code });

    if (!user) {
      return res.status(400).json({ msg: "Mã OTP không hợp lệ" });
    }

    if (!user.resetCodeExpire || user.resetCodeExpire < Date.now()) {
      return res.status(400).json({ msg: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." });
    }

    // Mã hóa pass mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Xóa mã OTP đã dùng
    user.resetCode = undefined;
    user.resetCodeExpire = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay." });
  } catch (err) {
    console.error('verifyResetCode error:', err);
    res.status(500).json({ msg: "Lỗi khi xác thực mã OTP", error: err.message });
  }
};

// Xác thực OTP khi đăng ký
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ msg: "Thiếu thông tin bắt buộc" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy tài khoản" });
    }

    if (user.verified) {
      return res.json({ message: "Tài khoản đã được xác thực trước đó", alreadyVerified: true });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ msg: "Mã OTP không chính xác" });
    }

    if (!user.otpExpire || user.otpExpire < Date.now()) {
      return res.status(400).json({ msg: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." });
    }

    // Đánh dấu đã xác thực
    user.verified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    // Tạo token để tự động login luôn
    const token = signToken(user);

    res.json({
      message: "Xác thực thành công! Chào mừng bạn đến với HM Jewelry 🎉",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ msg: "Lỗi xác thực OTP", error: err.message });
  }
};

// Gửi lại OTP (nếu hết hạn hoặc chưa nhận được)
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email là bắt buộc" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "Không tìm thấy tài khoản" });
    }

    if (user.verified) {
      return res.json({ message: "Tài khoản đã được xác thực", alreadyVerified: true });
    }

    // Tạo OTP mới
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Gửi lại email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0b5c5f; text-align: center;">🔄 Mã xác thực mới</h2>
        <p>Xin chào <strong>${user.name}</strong>,</p>
        <p>Bạn đã yêu cầu gửi lại mã xác thực.</p>
        <p>Mã OTP mới của bạn là:</p>
        <div style="background-color: #f0f9f9; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #0b5c5f; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #d32f2f; font-weight: bold;">⚠️ Mã này có hiệu lực trong 10 phút.</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">Trân trọng,<br><strong>Đội ngũ HM Jewelry</strong></p>
      </div>
    `;

    const mailResult = await sendMail({
      to: email,
      subject: '🔄 Mã OTP mới - HM Jewelry',
      html,
      text: `Mã OTP mới của bạn là: ${otp}. Có hiệu lực trong 10 phút.`
    });

    if (!mailResult || mailResult.error) {
      return res.status(500).json({
        msg: "Hệ thống đang bảo trì dịch vụ Email. Không thể gửi lại mã OTP vào lúc này.",
        error: mailResult?.error
      });
    }

    res.json({ message: "Đã gửi lại mã OTP mới! Vui lòng kiểm tra email của bạn." });
  } catch (err) {
    console.error('resendOtp error:', err);
    res.status(500).json({ msg: "Lỗi gửi lại OTP", error: err.message });
  }
};

