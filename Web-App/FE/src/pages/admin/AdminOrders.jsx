import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { api } from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders || response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });

      // Update local state for selectedOrder to reflect change immediately
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Lỗi khi cập nhật đơn hàng');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ Xử Lý' },
      processing: { bg: 'bg-luxury-sand', text: 'text-luxury-brown', label: 'Đang Xử Lý' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang Giao' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn Thành' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã Hủy' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
          <h1 className="font-display text-4xl text-luxury-black mb-2 tracking-wide">Quản Lý Đơn Hàng</h1>
          <p className="text-luxury-gray">Xem và cập nhật trạng thái đơn hàng</p>
        </div>

        { }
        <div className="card-luxury overflow-hidden">
          <table className="w-full">
            <thead className="bg-luxury-pearl border-b border-luxury-platinum">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Mã ĐH</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Khách Hàng</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Tổng Tiền</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Trạng Thái</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Ngày</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-luxury-darkGray uppercase tracking-widest">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="bg-luxury-white divide-y divide-luxury-platinum">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-luxury-pearl transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-luxury-black">#{order._id.slice(-8)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-luxury-black">{order.shippingAddress?.name}</div>
                      <div className="text-xs text-luxury-gray">{order.shippingAddress?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-luxury-black">
                    {(order.total / 1000000).toFixed(1)}M đ
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-luxury-gray">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="text-luxury-brown hover:text-luxury-charcoal text-sm font-medium"
                    >
                      Chi Tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      { }
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-luxury-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-luxury-platinum sticky top-0 bg-luxury-white">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-luxury-black tracking-wide">
                  Chi Tiết Đơn Hàng #{selectedOrder._id.slice(-8)}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-luxury-gray hover:text-luxury-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              { }
              <div>
                <label className="block text-sm font-medium text-luxury-darkGray mb-2 uppercase tracking-widest">
                  Trạng Thái Đơn Hàng
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                  className="input-luxury w-full"
                >
                  <option value="pending">Chờ Xử Lý</option>
                  <option value="processing">Đang Xử Lý</option>
                  <option value="shipped">Đang Giao</option>
                  <option value="completed">Hoàn Thành</option>
                  <option value="cancelled">Đã Hủy</option>
                </select>
              </div>

              { }
              <div className="border-t border-luxury-platinum pt-6">
                <h3 className="text-lg font-medium text-luxury-black mb-3">Thông Tin Khách Hàng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-luxury-gray">Họ Tên:</span>
                    <p className="text-luxury-black font-medium mt-1">{selectedOrder.shippingAddress?.name}</p>
                  </div>
                  <div>
                    <span className="text-luxury-gray">Số Điện Thoại:</span>
                    <p className="text-luxury-black font-medium mt-1">{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-luxury-gray">Địa Chỉ:</span>
                    <p className="text-luxury-black font-medium mt-1">
                      {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.city}
                    </p>
                  </div>
                </div>
              </div>

              { }
              <div className="border-t border-luxury-platinum pt-6">
                <h3 className="text-lg font-medium text-luxury-black mb-3">Sản Phẩm</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-luxury-pearl rounded">
                      {item.product?.images?.[0] && (
                        <img
                          src={item.product.images[0]?.url || item.product.images[0] || 'https://via.placeholder.com/100'}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded border border-luxury-platinum"
                        />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-luxury-black">{item.product?.name}</p>
                        <p className="text-xs text-luxury-gray mt-1">SL: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-luxury-black">
                          {((item.price * item.quantity) / 1000000).toFixed(1)}M đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              { }
              <div className="border-t border-luxury-platinum pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-luxury-gray">Tạm Tính:</span>
                    <span className="text-luxury-black">{(selectedOrder.subtotal / 1000000).toFixed(1)}M đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-luxury-gray">Phí Vận Chuyển:</span>
                    <span className="text-luxury-black">{(selectedOrder.shippingCost / 1000).toFixed(0)}K đ</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-luxury-gray">Giảm Giá:</span>
                      <span className="text-green-600">-{(selectedOrder.discount / 1000000).toFixed(1)}M đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-medium border-t border-luxury-platinum pt-2">
                    <span className="text-luxury-black">Tổng Cộng:</span>
                    <span className="text-luxury-black">{(selectedOrder.total / 1000000).toFixed(1)}M đ</span>
                  </div>
                </div>
              </div>

              { }
              <div className="border-t border-luxury-platinum pt-6">
                <h3 className="text-lg font-medium text-luxury-black mb-3">Thanh Toán</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-luxury-gray">Phương Thức:</span>
                    <p className="text-luxury-black font-medium mt-1">
                      {selectedOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                    </p>
                  </div>
                  <div>
                    <span className="text-luxury-gray">Trạng Thái:</span>
                    <p className={`font-medium mt-1 ${selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedOrder.paymentStatus === 'paid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
