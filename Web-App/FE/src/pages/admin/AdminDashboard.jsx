import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tempHistory, setTempHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FACE ID UNLOCK STATE ---
  const [faceIdState, setFaceIdState] = useState('idle'); // idle | scanning | success | fail
  const [countdown, setCountdown] = useState(30);
  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  // ----------------------------

  useEffect(() => {
    loadAllData();
    // Auto refresh every 30 seconds for real-time feel
    const interval = setInterval(loadTempHistory, 30000);

    // Socket.IO listener for Face ID scan result
    if (socket) {
      socket.on('face-scan-result', (data) => {
        console.log('[SOCKET] Face scan result:', data);
        clearInterval(countdownRef.current);

        if (data.success) {
          setFaceIdState('success');
        } else {
          setFaceIdState('fail');
        }

        setTimeout(() => setFaceIdState('idle'), 4000);
      });
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('face-scan-result');
      }
    };
  }, [socket]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadTempHistory()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadTempHistory = async () => {
    try {
      const response = await api.get('/security/temp-history?limit=24');
      if (response.data?.success) {
        const formattedData = response.data.data.reverse().map(item => ({
          ...item,
          time: new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          temp: item.temperature,
          humi: item.humidity
        }));
        setTempHistory(formattedData);
      }
    } catch (error) {
      console.error('Error loading temp history:', error);
    }
  };

  // Kích hoạt Face ID scan
  const triggerFaceIdUnlock = async () => {
    try {
      await api.post('/security/face-scan-trigger');
      setFaceIdState('scanning');
      setCountdown(30);

      // Đếm ngược 30 giây
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Timeout 30 giây: Nếu không nhận được kết quả → hiển thị thất bại
      setTimeout(() => {
        if (faceIdState === 'scanning') {
          clearInterval(countdownRef.current);
          setFaceIdState('fail');
          setTimeout(() => setFaceIdState('idle'), 4000);
        }
      }, 30000);

    } catch (error) {
      console.error('Face scan trigger error:', error);
      setFaceIdState('fail');
      setTimeout(() => setFaceIdState('idle'), 4000);
    }
  };

  const cancelFaceScan = () => {
    clearInterval(countdownRef.current);
    setFaceIdState('idle');
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
      <div className="space-y-8 pb-10">
        { }
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-display text-4xl text-luxury-black mb-2 tracking-wide uppercase">Hệ thống Quản trị</h1>
            <p className="text-luxury-gray font-light">Giám sát tổng quan & An ninh HM Jewelry</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-luxury-taupe uppercase tracking-widest mb-1">Cập nhật lúc</p>
            <p className="text-sm font-medium text-luxury-charcoal">{new Date().toLocaleTimeString('vi-VN')}</p>
          </div>
        </div>

        { }
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/products" className="card-luxury p-5 hover:shadow-xl transition-all duration-500 group border-b-2 border-luxury-brown bg-gradient-to-br from-white to-luxury-ivory">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-luxury-pearl rounded-xl flex items-center justify-center group-hover:bg-luxury-ivory transition-colors shadow-inner">
                <svg className="w-6 h-6 text-luxury-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-luxury-black group-hover:text-luxury-brown transition-colors">Sản phẩm</h3>
                <p className="text-2xl font-light text-luxury-charcoal">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/orders" className="card-luxury p-5 hover:shadow-xl transition-all duration-500 group border-b-2 border-luxury-brown bg-gradient-to-br from-white to-luxury-ivory">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-luxury-pearl rounded-xl flex items-center justify-center group-hover:bg-luxury-ivory transition-colors shadow-inner">
                <svg className="w-6 h-6 text-luxury-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-luxury-black group-hover:text-luxury-brown transition-colors">Đơn hàng</h3>
                <p className="text-2xl font-light text-luxury-charcoal">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </Link>

          <div className="card-luxury p-5 bg-gradient-to-br from-white to-luxury-ivory border-b-2 border-luxury-brown">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-luxury-brown" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-luxury-brown">Doanh thu</h3>
                <p className="text-2xl font-semibold text-luxury-black">
                  {stats?.totalRevenue ? (stats.totalRevenue >= 1000000 ? `${(stats.totalRevenue / 1000000).toFixed(1)}Tr` : `${stats.totalRevenue.toLocaleString()}đ`) : '0đ'}
                </p>
              </div>
            </div>
          </div>

          <Link to="/admin/users" className="card-luxury p-5 hover:shadow-xl transition-all duration-500 group border-b-2 border-luxury-brown bg-gradient-to-br from-white to-luxury-ivory">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-luxury-pearl rounded-xl flex items-center justify-center group-hover:bg-luxury-ivory transition-colors shadow-inner">
                <svg className="w-6 h-6 text-luxury-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-luxury-black group-hover:text-luxury-brown transition-colors">Khách hàng</h3>
                <p className="text-2xl font-light text-luxury-charcoal">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </Link>
        </div>

        { }
        <div className="card-luxury p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-display text-2xl text-luxury-black tracking-wide uppercase">Giám sát An ninh IoT</h2>
              <p className="text-sm text-luxury-gray font-light mt-1">Lịch sử Biến động Nhiệt độ & Độ ẩm trong 24 giờ qua</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-xs text-luxury-gray uppercase tracking-tighter">Nhiệt độ (°C)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-xs text-luxury-gray uppercase tracking-tighter">Độ ẩm (%)</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {tempHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempHistory}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHumi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                    minTickGap={30}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTemp)"
                    name="Nhiệt độ (°C)"
                  />
                  <Area
                    type="monotone"
                    dataKey="humi"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorHumi)"
                    name="Độ ẩm (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-luxury-gray opacity-50">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm font-light italic">Chưa có dữ liệu cảm biến - Đang chờ kết nối Edge AI...</p>
              </div>
            )}
          </div>
        </div>

        { }
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          { }
          <div className="card-luxury p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl text-luxury-black tracking-wide uppercase">Đơn Hàng Mới Nhất</h2>
              <Link to="/admin/orders" className="text-xs text-luxury-brown hover:underline tracking-widest uppercase">Xem tất cả</Link>
            </div>
            <div className="space-y-4">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.slice(0, 4).map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-4 border-b border-luxury-platinum last:border-0 hover:bg-luxury-ivory px-2 transition-colors rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-luxury-black">#{order._id.slice(-6)}</p>
                      <p className="text-[10px] text-luxury-gray uppercase tracking-widest mt-1">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-luxury-charcoal mb-1">
                        {order.total.toLocaleString()}đ
                      </p>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-tighter ${order.status === 'completed' ? 'bg-green-50 text-green-600' :
                        order.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                          order.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                            order.status === 'pending' ? 'bg-luxury-sand text-luxury-brown' :
                              'bg-gray-50 text-gray-400'
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-luxury-gray font-light italic">Chưa có đơn hàng nào</p>
              )}
            </div>
          </div>

          { }
          <div className="card-luxury p-6 shadow-sm">
            <h2 className="font-display text-xl text-luxury-black mb-6 tracking-wide uppercase">Chỉ số Hệ thống</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-luxury-pearl rounded-xl border border-luxury-platinum">
                <p className="text-[10px] text-luxury-gray uppercase tracking-widest mb-1">Chờ xử lý</p>
                <p className="text-2xl font-light text-luxury-charcoal">{stats?.pendingOrders || 0}</p>
              </div>
              <div className="p-4 bg-luxury-pearl rounded-xl border border-luxury-platinum">
                <p className="text-[10px] text-luxury-gray uppercase tracking-widest mb-1">Đang giao</p>
                <p className="text-2xl font-light text-luxury-charcoal">{stats?.shippingOrders || 0}</p>
              </div>
              <div className="p-4 bg-luxury-pearl rounded-xl border border-luxury-platinum">
                <p className="text-[10px] text-luxury-gray uppercase tracking-widest mb-1">Hết hàng</p>
                <p className="text-2xl font-light text-red-400">{stats?.outOfStock || 0}</p>
              </div>
              <div className="p-4 bg-luxury-pearl rounded-xl border border-luxury-platinum">
                <p className="text-[10px] text-luxury-gray uppercase tracking-widest mb-1">Đánh giá mới</p>
                <p className="text-2xl font-light text-luxury-charcoal">{stats?.newReviews || 0}</p>
              </div>
            </div>

            {/* === NÚT MỞ TỦ FACEID === */}
            <button
              id="btn-faceid-unlock"
              onClick={triggerFaceIdUnlock}
              disabled={faceIdState !== 'idle'}
              className="mt-4 w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-luxury-brown to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-luxury-brown transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              <span className="text-sm font-semibold tracking-widest uppercase">Mở Tủ — Quét FaceID</span>
            </button>

            <Link to="/admin/security" className="mt-3 flex items-center justify-between p-4 bg-luxury-charcoal text-white rounded-xl hover:bg-luxury-black transition-all group">
              <span className="text-sm font-light tracking-widest uppercase">Giám sát An ninh Camera</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* === MODAL FACE ID === */}
      {faceIdState !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 w-96 shadow-2xl flex flex-col items-center gap-6 animate-fade-in">

            {faceIdState === 'scanning' && (
              <>
                {/* Vòng tròn countdown animation */}
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="#92400e" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - countdown / 60)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-luxury-brown mb-1 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    {countdown > 8 ? (
                      <span className="text-xl font-bold text-luxury-brown">{countdown}s</span>
                    ) : (
                      <div className="flex space-x-1 mt-1">
                        <div className="w-2 h-2 bg-luxury-brown rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-luxury-brown rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-luxury-brown rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl text-luxury-black tracking-wide uppercase mb-2">
                    {countdown > 8 ? 'Đang chờ Camera' : 'AI Đang Xử Lý'}
                  </h3>
                  <p className="text-sm text-luxury-gray font-light whitespace-pre-line">
                    {countdown > 8
                      ? 'Camera đang chụp ảnh khuôn mặt của bạn.\nHãy nhìn thẳng vào thiết bị.'
                      : 'Đang trích xuất đặc trưng khuôn mặt...\nVui lòng đợi hệ thống xác thực.'}
                  </p>
                </div>
                <button onClick={cancelFaceScan} className="text-xs text-luxury-gray hover:text-red-500 uppercase tracking-widest transition-colors mt-2">Hủy Bỏ</button>
              </>
            )}

            {faceIdState === 'success' && (
              <>
                <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center">
                  <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl text-green-600 uppercase tracking-wide mb-1">Xác thực thành công!</h3>
                  <p className="text-sm text-luxury-gray font-light">Tủ đã được mở — tự động khóa sau 10 giây.</p>
                </div>
              </>
            )}

            {faceIdState === 'fail' && (
              <>
                <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl text-red-600 uppercase tracking-wide mb-1">Không nhận diện được</h3>
                  <p className="text-sm text-luxury-gray font-light">Khuôn mặt không khớp hoặc camera bị che khuất.</p>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
