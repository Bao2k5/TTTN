import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AccountOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, shipped, delivered, cancelled

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || response.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đang giao',
      delivered: 'Đã giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="bg-luxury-white shadow-sm border border-luxury-sage/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-sage"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-luxury-white shadow-sm border border-luxury-sage/20 p-6">
        <h2 className="font-serif text-2xl md:text-3xl font-light text-luxury-charcoal mb-6">
          Đơn Hàng Của Tôi
        </h2>

        { }
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'pending', label: 'Chờ xử lý' },
            { key: 'shipped', label: 'Đang giao' },
            { key: 'delivered', label: 'Đã giao' },
            { key: 'cancelled', label: 'Đã hủy' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm tracking-wide transition-all duration-200 ${filter === tab.key
                ? 'bg-luxury-charcoal text-luxury-cream'
                : 'bg-luxury-cream text-luxury-brown hover:bg-luxury-sage/20'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      { }
      {filteredOrders.length === 0 ? (
        <div className="bg-luxury-white shadow-sm border border-luxury-sage/20 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-luxury-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-luxury-taupe text-base mb-4">Bạn chưa có đơn hàng nào</p>
          <Link
            to="/products"
            className="inline-block px-6 py-3 bg-luxury-charcoal text-luxury-cream hover:bg-luxury-brown transition-all duration-300 tracking-[0.2em] text-xs font-medium uppercase"
          >
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order._id}
            className="bg-luxury-white shadow-sm border border-luxury-sage/20 hover:shadow-md transition-shadow duration-200"
          >
            { }
            <div className="p-6 border-b border-luxury-sage/20 bg-luxury-cream/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-luxury-taupe text-sm mb-1">Mã đơn hàng</p>
                  <p className="text-luxury-charcoal font-medium">#{order._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-luxury-taupe text-sm mb-1">Ngày đặt</p>
                  <p className="text-luxury-charcoal">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-luxury-taupe text-sm mb-1">Tổng tiền</p>
                  <p className="text-luxury-charcoal font-medium">{formatPrice(order.totalPrice)}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>
            </div>

            { }
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <img
                      src={item.product?.images?.[0] || item.images?.[0] || 'https://via.placeholder.com/80'}
                      alt={item.product?.name || item.name}
                      className="w-20 h-20 object-cover border border-luxury-sage/20"
                    />
                    <div className="flex-1">
                      <h4 className="text-luxury-charcoal font-medium mb-1">
                        {item.product?.name || item.name}
                      </h4>
                      <p className="text-luxury-taupe text-sm">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-luxury-charcoal text-sm font-medium">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              { }
              <div className="flex gap-3 mt-6 pt-6 border-t border-luxury-sage/20">
                <Link
                  to={`/account/orders/${order._id}`}
                  className="px-4 py-2 bg-luxury-charcoal text-luxury-cream hover:bg-luxury-brown transition-all duration-300 text-xs tracking-[0.2em] uppercase"
                >
                  Xem chi tiết
                </Link>
                {order.status === 'delivered' && (
                  <button className="px-4 py-2 bg-luxury-white text-luxury-charcoal border border-luxury-sage/30 hover:bg-luxury-cream transition-all duration-300 text-xs tracking-[0.2em] uppercase">
                    Mua lại
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AccountOrders;
