import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success('Đổi mật khẩu thành công!');

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      const errorMsg = error.response?.data?.msg || error.response?.data?.message || 'Đổi mật khẩu thất bại';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-light text-luxury-charcoal mb-2">Cài Đặt Tài Khoản</h1>
        <div className="w-16 h-px bg-luxury-sage"></div>
      </div>

      {}
      <div className="bg-white border border-luxury-sand p-6 md:p-8 shadow-sm">
        <h2 className="text-xl font-serif font-light text-luxury-charcoal mb-6">Đổi Mật Khẩu</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          <div>
            <label className="block text-luxury-charcoal font-light mb-2">
              Mật khẩu hiện tại *
            </label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
          </div>

          {}
          <div>
            <label className="block text-luxury-charcoal font-light mb-2">
              Mật khẩu mới *
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
              placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
              required
            />
          </div>

          {}
          <div>
            <label className="block text-luxury-charcoal font-light mb-2">
              Xác nhận mật khẩu mới *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border border-luxury-beige px-4 py-3 focus:outline-none focus:border-luxury-taupe font-light"
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          {}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-luxury-charcoal text-luxury-cream px-8 py-3 hover:bg-luxury-brown transition-colors tracking-wider uppercase text-sm font-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </div>
        </form>
      </div>

      {}
      <div className="mt-6 p-6 bg-luxury-ivory border border-luxury-sand">
        <h3 className="text-lg font-serif font-light text-luxury-charcoal mb-3">💡 Lưu ý bảo mật</h3>
        <ul className="space-y-2 text-luxury-brown text-sm font-light">
          <li>• Mật khẩu nên có ít nhất 6 ký tự</li>
          <li>• Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
          <li>• Không chia sẻ mật khẩu với người khác</li>
          <li>• Thay đổi mật khẩu định kỳ để bảo vệ tài khoản</li>
        </ul>
      </div>
    </div>
  );
};

export default AccountSettings;
