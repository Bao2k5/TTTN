import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginSuccess } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Đăng nhập Google thất bại!');
      navigate('/login');
      return;
    }

    if (token) {
      // Gọi API lấy thông tin user
      api.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          const user = response.data.user || response.data;
          // Cập nhật store và localStorage
          loginSuccess(user, token);

          toast.success('Đăng nhập thành công! Chào mừng bạn quay lại.');
          navigate('/');
        })
        .catch((err) => {
          console.error('Lỗi lấy profile:', err);
          toast.error('Không thể lấy thông tin người dùng!');
          navigate('/login');
        });
    } else {
      toast.error('Không tìm thấy token xác thực!');
      navigate('/login');
    }
  }, [searchParams, navigate, loginSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-600 mt-2">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
};

export default AuthCallback;
