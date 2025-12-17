import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=20`);
      setUsers(response.data.users || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}`, { role: newRole });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Lỗi khi cập nhật người dùng');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi khi xóa người dùng: ' + (error.response?.data?.message || error.message));
    }
  };



  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-black"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        { }
        <div>
          <h1 className="font-display text-4xl text-luxury-black mb-2 tracking-wide">Quản Lý Người Dùng</h1>
          <p className="text-luxury-gray">Xem và cập nhật thông tin người dùng</p>
        </div>

        { }
        <div className="card-luxury overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxury-pearl border-b border-luxury-platinum">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Người Dùng</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Vai Trò</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Xác Thực</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Ngày Tạo</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="bg-luxury-white divide-y divide-luxury-platinum">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-luxury-pearl transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-luxury-pearl rounded-full flex items-center justify-center">
                        <span className="text-luxury-darkGray font-medium">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-luxury-black">{user.name || 'Chưa có tên'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-luxury-gray">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                      className="text-sm border border-luxury-platinum rounded px-2 py-1 focus:outline-none focus:border-luxury-darkGray"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="seller">Seller</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.emailVerified ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Đã xác thực</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Chưa xác thực</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-luxury-gray">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    {String(user.role).toLowerCase() !== 'admin' && (
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        { }
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-luxury-platinum text-luxury-darkGray disabled:opacity-50 hover:bg-luxury-pearl transition-colors"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-luxury-black">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-luxury-platinum text-luxury-darkGray disabled:opacity-50 hover:bg-luxury-pearl transition-colors"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
