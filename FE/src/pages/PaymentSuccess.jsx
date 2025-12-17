import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import orderService from '../services/orderService';
import paymentService from '../services/paymentService';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method');
  const resultCode = searchParams.get('resultCode'); // MoMo
  const vnpResponseCode = searchParams.get('vnp_ResponseCode'); // VNPay

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('success');

  useEffect(() => {
    const verifyAndFetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        // Nếu có resultCode từ URL (đã verify hoặc simulate), không cần verify lại
        if (resultCode === '0' || resultCode === 0) {
          // Đã thanh toán thành công, không cần verify lại
          setPaymentStatus('success');
        } else if (resultCode) {
          // Có resultCode nhưng không phải 0, có thể là lỗi
          setPaymentStatus('failed');
        } else if (vnpResponseCode) {

          setVerifying(true);
          const verifyResult = await paymentService.queryVNPayPayment(orderId);
          if (verifyResult.success && verifyResult.vnp_ResponseCode === '00') {
            setPaymentStatus('success');
          } else {
            setPaymentStatus('failed');
          }
          setVerifying(false);
        }

        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Error:', error);
        setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    verifyAndFetchOrder();
  }, [orderId, resultCode, vnpResponseCode]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-luxury-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-luxury-gold mx-auto"></div>
          <p className="mt-4 text-luxury-charcoal">
            {verifying ? 'Đang xác thực thanh toán...' : 'Đang tải thông tin đơn hàng...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-luxury-ivory to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            {}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-light mb-4 text-luxury-charcoal tracking-wide">
              ĐẶT HÀNG THÀNH CÔNG
            </h1>
            <div className="w-20 h-1 bg-luxury-taupe mx-auto mb-6"></div>
            <p className="text-luxury-brown text-lg font-light mb-2">
              Cảm ơn bạn đã mua sắm tại HM Jewelry
            </p>
            {order && (
              <p className="text-luxury-taupe font-light">
                Mã đơn hàng: <span className="font-medium">{order._id}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {order ? (
          <div className="bg-white border border-luxury-beige p-8 mb-8">
            <h2 className="text-2xl font-light text-luxury-charcoal mb-6 tracking-wide">
              THÔNG TIN ĐƠN HÀNG
            </h2>

            <div className="space-y-6">
              {}
              <div className="pb-6 border-b border-luxury-beige">
                <p className="text-sm text-luxury-taupe mb-2">Trạng thái</p>
                <span className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded text-sm font-medium">
                  {order.status === 'paid' ? 'Đã thanh toán' : 'Chờ xác nhận'}
                </span>
              </div>

              {}
              <div className="pb-6 border-b border-luxury-beige">
                <p className="text-sm text-luxury-taupe mb-2">Phương thức thanh toán</p>
                <p className="text-luxury-charcoal font-light">
                  {order.payment?.method === 'momo' && 'Ví MoMo'}
                  {order.payment?.method === 'vnpay' && 'VNPay'}
                  {order.payment?.method === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                  {order.payment?.method === 'bank' && 'Chuyển khoản ngân hàng'}
                  {order.payment?.method === 'mock' && 'Thanh toán trực tuyến'}
                </p>
              </div>

              {}
              <div className="pb-6 border-b border-luxury-beige">
                <p className="text-sm text-luxury-taupe mb-2">Tổng tiền</p>
                <p className="text-2xl text-luxury-charcoal font-light">{formatPrice(order.total)}</p>
              </div>

              {}
              <div>
                <p className="text-sm text-luxury-taupe mb-2">Địa chỉ giao hàng</p>
                <p className="text-luxury-charcoal font-light">{order.address}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-luxury-ivory border border-luxury-beige p-8 mb-8 text-center">
            <p className="text-luxury-brown font-light">
              Không tìm thấy thông tin đơn hàng
            </p>
          </div>
        )}

        {}
        <div className="flex gap-4 justify-center">
          {order && (
            <Link
              to={`/account/orders`}
              className="border-2 border-luxury-charcoal text-luxury-charcoal px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-charcoal hover:text-white transition-all duration-300"
            >
              XEM ĐƠN HÀNG
            </Link>
          )}
          <Link
            to="/"
            className="bg-luxury-charcoal text-white px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-brown transition-all duration-300"
          >
            TIẾP TỤC MUA SẮM
          </Link>
        </div>

        {}
        <div className="mt-12 bg-luxury-ivory border border-luxury-beige p-6">
          <h3 className="text-lg font-light text-luxury-charcoal mb-4">Thông tin quan trọng</h3>
          <ul className="space-y-2 text-luxury-brown font-light text-sm">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-luxury-taupe flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Đơn hàng của bạn đang được xử lý và sẽ được giao trong vòng 3-5 ngày làm việc
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-luxury-taupe flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Chúng tôi đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-luxury-taupe flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi"
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
