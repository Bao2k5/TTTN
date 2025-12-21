import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const data = await orderService.getOrderById(id);
        if (mounted) setOrder(data);
      } catch (err) {
        setError(err.message || 'Không thể tải đơn hàng');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!order) return <div className="p-8">Đơn hàng không tồn tại</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Chi tiết đơn #{order._id}</h2>
        <Link to="/orders" className="text-luxury-brown">← Quay lại</Link>
      </div>

      <div className="bg-white border border-luxury-beige p-4 rounded-md">
        <div className="mb-3">Trạng thái: <strong>{order.status}</strong></div>
        <div className="mb-3">Tổng: <strong>{order.total?.toLocaleString?.() ?? order.total} VND</strong></div>
        <div className="mb-3">Ngày: {new Date(order.createdAt).toLocaleString()}</div>
        <div className="mb-3">Địa chỉ giao hàng: {order.address || '—'}</div>

        <h3 className="mt-4 font-medium">Sản phẩm</h3>
        <ul className="mt-2 space-y-2">
          {order.items?.map(it => (
            <li key={it.product} className="flex items-center justify-between border p-2 rounded">
              <div>
                <div className="font-medium">{it.product?.name || it.product}</div>
                <div className="text-sm text-gray-600">Số lượng: {it.qty} × Giá: {it.price?.toLocaleString?.() ?? it.price} VND</div>
              </div>
              <div className="text-right">Thành tiền: {(it.qty * it.price)?.toLocaleString?.()} VND</div>
            </li>
          ))}
        </ul>

        {order.payment?.status !== 'paid' && (
          <div className="mt-4">
            <button className="px-4 py-2 bg-luxury-charcoal text-white rounded" onClick={async () => {
              try {
                await orderService.mockPayment(order._id);
                const updated = await orderService.getOrderById(order._id);
                setOrder(updated);
              } catch (err) {
                setError(err.message || 'Lỗi thanh toán');
              }
            }}>Đã thanh toán</button>
          </div>
        )}
      </div>
    </div>
  );
}
