import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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
      <div className="space-y-8">
        {}
        <div>
          <h1 className="font-display text-4xl text-luxury-black mb-2 tracking-wide">Dashboard</h1>
          <p className="text-luxury-gray">Tổng quan hệ thống HM Jewelry</p>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/products" className="card-luxury p-4 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-luxury-pearl rounded-lg flex items-center justify-center group-hover:bg-luxury-sage transition-colors">
                <svg className="w-5 h-5 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h18v10H3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-luxury-black">Sản phẩm</h3>
                <p className="text-xs text-luxury-gray">Quản lý sản phẩm</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/orders" className="card-luxury p-4 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-luxury-pearl rounded-lg flex items-center justify-center group-hover:bg-luxury-sage transition-colors">
                <svg className="w-5 h-5 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M3 6h18M3 14h18" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-luxury-black">Đơn hàng</h3>
                <p className="text-xs text-luxury-gray">Quản lý đơn hàng</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/collections" className="card-luxury p-4 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-luxury-pearl rounded-lg flex items-center justify-center group-hover:bg-luxury-sage transition-colors">
                <svg className="w-5 h-5 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-luxury-black">Bộ sưu tập</h3>
                <p className="text-xs text-luxury-gray">Quản lý BST</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/users" className="card-luxury p-4 hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-luxury-pearl rounded-lg flex items-center justify-center group-hover:bg-luxury-sage transition-colors">
                <svg className="w-5 h-5 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-luxury-black">Người dùng</h3>
                <p className="text-xs text-luxury-gray">Quản lý users</p>
              </div>
            </div>
          </Link>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {}
          <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-luxury-pearl rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-luxury-black mb-1">
              {stats?.totalRevenue ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` : '0'}đ
            </h3>
            <p className="text-sm text-luxury-gray uppercase tracking-widest">Doanh Thu</p>
          </div>

          {}
          <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-luxury-pearl rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-luxury-black mb-1">{stats?.totalOrders || 0}</h3>
            <p className="text-sm text-luxury-gray uppercase tracking-widest">Đơn Hàng</p>
          </div>

          {}
          <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-luxury-pearl rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-luxury-black mb-1">{stats?.totalProducts || 0}</h3>
            <p className="text-sm text-luxury-gray uppercase tracking-widest">Sản Phẩm</p>
          </div>

          {}
          <div className="card-luxury p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-luxury-pearl rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-luxury-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-light text-luxury-black mb-1">{stats?.totalUsers || 0}</h3>
            <p className="text-sm text-luxury-gray uppercase tracking-widest">Người Dùng</p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <div className="card-luxury p-6">
            <h2 className="font-display text-2xl text-luxury-black mb-6 tracking-wide">Đơn Hàng Mới</h2>
            <div className="space-y-4">
              {stats?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between py-3 border-b border-luxury-platinum last:border-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-luxury-black">#{order._id.slice(-6)}</p>
                    <p className="text-xs text-luxury-gray mt-1">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-luxury-black">{(order.total / 1000000).toFixed(1)}M đ</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-luxury-sand text-luxury-brown' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {}
          <div className="card-luxury p-6">
            <h2 className="font-display text-2xl text-luxury-black mb-6 tracking-wide">Thống Kê Nhanh</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-luxury-platinum">
                <span className="text-sm text-luxury-gray uppercase tracking-widest">Đơn Chờ Xử Lý</span>
                <span className="text-lg font-light text-luxury-black">{stats?.pendingOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-luxury-platinum">
                <span className="text-sm text-luxury-gray uppercase tracking-widest">Đơn Đang Giao</span>
                <span className="text-lg font-light text-luxury-black">{stats?.shippingOrders || 0}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-luxury-platinum">
                <span className="text-sm text-luxury-gray uppercase tracking-widest">Sản Phẩm Hết Hàng</span>
                <span className="text-lg font-light text-luxury-black">{stats?.outOfStock || 0}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-luxury-gray uppercase tracking-widest">Đánh Giá Mới</span>
                <span className="text-lg font-light text-luxury-black">{stats?.newReviews || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
