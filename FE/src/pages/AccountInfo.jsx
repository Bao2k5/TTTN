import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { updateProfile } from '../services/userService';
import toast from 'react-hot-toast';

const AccountInfo = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.');
      return;
    }

    setLoading(true);
    try {
      const response = await updateProfile({
        name: formData.name,
        phone: formData.phone
      });

      if (response.user) {
        updateUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
      const msg = error?.response?.data?.msg || error?.response?.data?.message || 'Cập nhật thất bại';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-luxury-white shadow-sm border border-luxury-sage/20 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-luxury-charcoal">
          Thông Tin Tài Khoản
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-luxury-sage hover:text-luxury-charcoal transition-colors text-sm tracking-wide"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-luxury-brown text-sm mb-2 tracking-wide">
              Họ và tên
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-cream/30 text-luxury-charcoal border border-luxury-sage/20 focus:border-luxury-sage focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-luxury-brown text-sm mb-2 tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-cream/30 text-luxury-charcoal border border-luxury-sage/20 focus:border-luxury-sage focus:outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-luxury-brown text-sm mb-2 tracking-wide">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-luxury-cream/30 text-luxury-charcoal border border-luxury-sage/20 focus:border-luxury-sage focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-luxury-charcoal text-luxury-cream hover:bg-luxury-brown transition-all duration-300 tracking-[0.2em] text-xs font-medium uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="px-6 py-3 bg-luxury-white text-luxury-charcoal border border-luxury-sage/30 hover:bg-luxury-cream transition-all duration-300 tracking-[0.2em] text-xs font-medium uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="pb-4 border-b border-luxury-sage/20">
            <p className="text-luxury-taupe text-sm mb-1">Họ và tên</p>
            <p className="text-luxury-charcoal text-base">{user?.name || 'Chưa cập nhật'}</p>
          </div>

          <div className="pb-4 border-b border-luxury-sage/20">
            <p className="text-luxury-taupe text-sm mb-1">Email</p>
            <p className="text-luxury-charcoal text-base">{user?.email || 'Chưa cập nhật'}</p>
          </div>

          <div className="pb-4 border-b border-luxury-sage/20">
            <p className="text-luxury-taupe text-sm mb-1">Số điện thoại</p>
            <p className="text-luxury-charcoal text-base">{user?.phone || 'Chưa cập nhật'}</p>
          </div>

          <div className="pb-4">
            <p className="text-luxury-taupe text-sm mb-1">Ngày tham gia</p>
            <p className="text-luxury-charcoal text-base">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountInfo;
