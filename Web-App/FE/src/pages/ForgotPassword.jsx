import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP + New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/send-reset-code`, { email });
      setMessage(response.data.message || 'Mã OTP đã được gửi đến email của bạn!');
      setStep(2);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.msg || err.response?.data?.error || 'Không thể gửi mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/verify-reset-code`, {
        email,
        code: otp,
        newPassword
      });
      setError('');
      setMessage(response.data.message || 'Đặt lại mật khẩu thành công!');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Verify reset code error:', err);
      setMessage('');
      setError(err.response?.data?.msg || err.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-ivory to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white border border-luxury-beige p-8 shadow-lg">
        {}
        <div className="text-center">
          <h2 className="text-3xl font-light text-luxury-charcoal tracking-wide">QUÊN MẬT KHẨU</h2>
          <div className="w-20 h-1 bg-luxury-taupe mx-auto mt-4 mb-6"></div>
          <p className="mt-2 text-sm text-luxury-brown font-light">
            {step === 1 
              ? 'Nhập email để nhận mã OTP' 
              : 'Nhập mã OTP và mật khẩu mới'}
          </p>
        </div>

        {}
        {message && (
          <div className="bg-accent-mintLight border-l-4 border-luxury-sage p-4 rounded">
            <p className="text-luxury-charcoal text-sm font-light">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-200 p-4 rounded">
            <p className="text-red-700 text-sm font-light">{error}</p>
          </div>
        )}

        {}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-light text-luxury-charcoal mb-2">
                Email đã đăng ký
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-luxury-beige placeholder-luxury-taupe text-luxury-charcoal rounded-lg focus:outline-none focus:border-luxury-taupe font-light"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-luxury-charcoal text-white py-4 text-sm font-light tracking-wider hover:bg-luxury-brown transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ĐANG GỬI...' : 'GỬI MÃ OTP'}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-luxury-taupe hover:text-luxury-charcoal font-light">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}

        {}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-light text-luxury-charcoal mb-2">
                Mã OTP (6 số)
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength="6"
                pattern="[0-9]{6}"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="appearance-none relative block w-full px-4 py-3 border border-luxury-beige placeholder-luxury-taupe text-luxury-charcoal rounded-lg focus:outline-none focus:border-luxury-taupe text-center text-2xl tracking-widest font-bold"
                placeholder="000000"
              />
              <p className="mt-1 text-xs text-luxury-taupe font-light">Kiểm tra email của bạn để lấy mã</p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-light text-luxury-charcoal mb-2">
                Mật khẩu mới
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength="6"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-luxury-beige placeholder-luxury-taupe text-luxury-charcoal rounded-lg focus:outline-none focus:border-luxury-taupe font-light"
                placeholder="Ít nhất 6 ký tự"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-light text-luxury-charcoal mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength="6"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-luxury-beige placeholder-luxury-taupe text-luxury-charcoal rounded-lg focus:outline-none focus:border-luxury-taupe font-light"
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setMessage('');
                }}
                className="flex-1 py-3 px-4 border border-luxury-beige rounded-lg text-sm font-light text-luxury-brown bg-white hover:bg-luxury-ivory focus:outline-none transition-colors"
              >
                ← Quay lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-luxury-charcoal text-white rounded-lg hover:bg-luxury-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-light"
              >
                {loading ? 'ĐANG XỬ LÝ...' : 'ĐẶT LẠI MẬT KHẨU'}
              </button>
            </div>

            {}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setMessage('');
                  setError('');
                }}
                className="text-sm text-luxury-taupe hover:text-luxury-charcoal font-light"
              >
                📧 Gửi lại mã OTP
              </button>
            </div>
          </form>
        )}

        {}
        <div className="text-center mt-6 pt-6 border-t border-luxury-beige">
          <p className="text-xs text-luxury-taupe font-light">
            Mã OTP có hiệu lực trong <strong className="text-luxury-charcoal">10 phút</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
