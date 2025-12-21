import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    token: searchParams.get('token') || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formData.email || !formData.token) {
      alert('Link không hợp lệ');
      navigate('/login');
    }
  }, [formData.email, formData.token, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email: formData.email,
        token: formData.token,
        newPassword: formData.newPassword,
      });

      alert(response.data.message || 'Đặt lại mật khẩu thành công!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      alert(err.response?.data?.msg || 'Đặt lại mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-silverPearlDark to-luxury-silverPearl flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-luxury-silverPearl rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-luxury-deepBlack">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-sm text-luxury-steelGrey">Nhập mật khẩu mới của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-luxury-deepBlack">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-luxury-metallicSilver rounded-md shadow-sm bg-luxury-silverPearlDark cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-luxury-deepBlack">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={formData.newPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-luxury-metallicSilver rounded-md shadow-sm focus:outline-none focus:ring-luxury-platinumGrey focus:border-luxury-platinumGrey"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-luxury-deepBlack">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-luxury-metallicSilver rounded-md shadow-sm focus:outline-none focus:ring-luxury-platinumGrey focus:border-luxury-platinumGrey"
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? 'bg-luxury-steelGrey cursor-not-allowed'
                : 'bg-luxury-deepBlack hover:bg-luxury-platinumGrey transition-colors'
            }`}
          >
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-luxury-steelGrey hover:text-luxury-deepBlack font-medium"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
