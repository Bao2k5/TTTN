import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      alert('Đăng nhập OAuth thất bại!');
      navigate('/login');
      return;
    }

    if (token) {

      localStorage.setItem('token', token);
      setToken(token);

      api.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((response) => {
          setUser(response.data);
          alert('Đăng nhập thành công!');
          navigate('/');
        })
        .catch(() => {
          alert('Không thể lấy thông tin người dùng!');
          navigate('/login');
        });
    } else {
      alert('Không tìm thấy token!');
      navigate('/login');
    }
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-600 mt-2">Vui lòng chờ một chút</p>
      </div>
    </div>
  );
};

export default AuthCallback;
