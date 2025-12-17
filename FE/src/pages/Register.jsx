import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      setMessage(response.data.message || 'Đăng ký thành công! Vui lòng kiểm tra email.');
      setStep(2);
      setResendTimer(60); // Start 60s countdown
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.msg || err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 số!');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        email: formData.email,
        otp
      });

      // Clear error và set message thành công
      setError('');
      setOtpVerified(true);
      setMessage(response.data.message || 'Xác thực thành công! Chào mừng bạn đến với HM Jewelry 🥳');

      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        // Lưu vào localStorage để đảm bảo thông tin được lưu
        try {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } catch (err) {
          console.error('Error saving user to localStorage:', err);
        }
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      // Clear message và chỉ hiện error
      setMessage('');
      setError(err.response?.data?.msg || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/resend-otp`, {
        email: formData.email
      });

      setMessage(response.data.message || 'Đã gửi lại mã OTP!');
      setResendTimer(60); // Restart countdown
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.msg || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Chuyển hướng sau 2 giây khi OTP đã được xác thực thành công
  useEffect(() => {
    if (otpVerified) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [otpVerified, navigate]);

  const pageVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  };

  const successVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 200, damping: 15 }
    },
    exit: { opacity: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-silverPearlDark to-luxury-silverPearl flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        { }
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-light text-luxury-deepBlack tracking-wide">
            {step === 1 && 'ĐĂNG KÝ TÀI KHOẢN'}
            {step === 2 && 'XÁC THỰC OTP'}
            {step === 3 && 'HOÀN THÀNH'}
          </h2>
          <p className="mt-2 text-sm text-luxury-steelGrey font-light">
            {step === 1 && 'Tạo tài khoản mới tại HM Jewelry'}
            {step === 2 && 'Nhập mã OTP đã gửi đến email của bạn'}
            {step === 3 && 'Chào mừng bạn đến với HM Jewelry!'}
          </p>
        </motion.div>

        { }
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key="success-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-luxury-platinumLight border-l-4 border-luxury-metallicSilver p-4 rounded"
            >
              <p className="text-luxury-deepBlack text-sm font-light">{message}</p>
            </motion.div>
          )}

          {error && !otpVerified && (
            <motion.div
              key="error-message"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 border-l-4 border-red-200 p-4 rounded"
            >
              <p className="text-red-700 text-sm font-light">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        { }
        <div className="bg-luxury-silverPearl border border-luxury-metallicSilver p-8 shadow-lg">
          <AnimatePresence mode="wait">
            { }
            {step === 2 && otpVerified && (
              <motion.div
                key="success-message-in-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4 py-8"
              >
                <div className="mx-auto w-16 h-16 bg-accent-mintLight rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <h3 className="text-xl font-light text-luxury-deepBlack">
                  Đăng ký thành công!
                </h3>
                <p className="text-sm text-luxury-brown font-light">
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
              </motion.div>
            )}

            { }
            {step === 1 && (
              <motion.form
                key="step1"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-light text-luxury-deepBlack mb-2">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-luxury-metallicSilver rounded-lg focus:outline-none focus:border-luxury-platinumGrey font-light"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-luxury-deepBlack mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-luxury-metallicSilver rounded-lg focus:outline-none focus:border-luxury-platinumGrey font-light"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-luxury-deepBlack mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-luxury-metallicSilver rounded-lg focus:outline-none focus:border-luxury-platinumGrey font-light"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-luxury-deepBlack mb-2">
                    Mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      minLength="6"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-luxury-metallicSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-platinumGrey focus:border-luxury-platinumGrey"
                      placeholder="Ít nhất 6 ký tự"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-platinumGrey hover:text-luxury-deepBlack"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-light text-luxury-deepBlack mb-2">
                    Xác nhận mật khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      minLength="6"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pr-12 border border-luxury-metallicSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-platinumGrey focus:border-luxury-platinumGrey"
                      placeholder="Nhập lại mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-platinumGrey hover:text-luxury-deepBlack"
                    >
                      {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-luxury-deepBlack text-luxury-silverPearl py-4 text-sm font-light tracking-wider hover:bg-luxury-steelGrey transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ & NHẬN OTP'}
                </button>

                <div className="text-center mt-4">
                  <p className="text-sm text-luxury-steelGrey font-light">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-luxury-deepBlack hover:text-luxury-steelGrey font-normal">
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </motion.form>
            )}

            { }
            {step === 2 && !otpVerified && (
              <motion.form
                key="step2"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOTP}
                className="space-y-6"
              >
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-luxury-silverPearlDark rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">📧</span>
                  </div>
                  <p className="text-sm text-luxury-steelGrey font-light">
                    Mã OTP đã được gửi đến<br />
                    <strong className="text-luxury-deepBlack">{formData.email}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light text-luxury-deepBlack mb-2 text-center">
                    Nhập mã OTP (6 số)
                  </label>
                  <input
                    type="text"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-luxury-metallicSilver rounded-lg focus:outline-none focus:border-luxury-platinumGrey text-center text-2xl tracking-widest font-bold"
                    placeholder="000000"
                  />
                  <p className="mt-1 text-xs text-luxury-platinumGrey text-center font-light">
                    Mã có hiệu lực trong 10 phút
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setError('');
                      setMessage('');
                      setOtpVerified(false);
                    }}
                    className="flex-1 py-3 px-4 border border-luxury-metallicSilver rounded-lg text-luxury-steelGrey hover:bg-luxury-metallicSilver/50 transition-colors font-light"
                  >
                    ← Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-luxury-deepBlack text-luxury-silverPearl rounded-lg hover:bg-luxury-steelGrey transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-light"
                  >
                    {loading ? '🔄 Đang xác thực...' : '✅ Xác nhận'}
                  </button>
                </div>

                { }
                <div className="text-center pt-4 border-t border-luxury-metallicSilver">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-luxury-platinumGrey font-light">
                      Gửi lại mã sau <strong className="text-luxury-deepBlack">{resendTimer}s</strong>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm text-luxury-platinumGrey hover:text-luxury-deepBlack font-light disabled:opacity-50"
                    >
                      📧 Gửi lại mã OTP
                    </button>
                  )}
                </div>
              </motion.form>
            )}

            { }
            {step === 3 && (
              <motion.div
                key="step3"
                variants={successVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center space-y-6 py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <span className="text-5xl">🎉</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-2xl font-light text-luxury-charcoal mb-2">
                    Đăng ký thành công!
                  </h3>
                  <p className="text-luxury-brown">
                    Chào mừng bạn đến với <strong>HM Jewelry</strong>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-2 text-sm text-luxury-taupe"
                >
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-luxury-charcoal border-t-transparent"></div>
                  <span>Đang chuyển hướng...</span>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        { }
        {step !== 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-xs text-luxury-taupe font-light"
          >
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link to="/terms" className="text-luxury-taupe hover:text-luxury-charcoal">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="text-luxury-taupe hover:text-luxury-charcoal">
              Chính sách bảo mật
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
