import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Lỗi khi tải đơn hàng');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrders();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-8">Đang tải đơn hàng...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Lịch sử đơn hàng</h2>
      {orders.length === 0 ? (
        <div className="p-6 bg-white border border-luxury-beige">Bạn chưa có đơn hàng</div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="p-4 bg-white border border-luxury-beige rounded-md flex justify-between items-center">
              <div>
                <div className="font-medium">Đơn #{o._id}</div>
                <div className="text-sm text-gray-600">Ngày: {new Date(o.createdAt).toLocaleString()}</div>
                <div className="text-sm text-gray-600">Tổng: {o.total?.toLocaleString?.() ?? o.total} VND</div>
                <div className="text-sm text-gray-600">Trạng thái: {o.status}</div>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/orders/${o._id}`} className="px-4 py-2 border border-luxury-charcoal text-luxury-charcoal rounded hover:bg-luxury-charcoal hover:text-white transition">Xem chi tiết</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
