import { Link, useSearchParams } from 'react-router-dom';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const message = searchParams.get('msg') || 'Thanh toán đã bị hủy';

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-luxury-ivory to-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            {}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-4xl font-light mb-4 text-luxury-charcoal tracking-wide">
              THANH TOÁN THẤT BẠI
            </h1>
            <div className="w-20 h-1 bg-luxury-taupe mx-auto mb-6"></div>
            <p className="text-luxury-brown text-lg font-light mb-2">
              {message}
            </p>
            {orderId && (
              <p className="text-luxury-taupe font-light">
                Mã đơn hàng: <span className="font-medium">{orderId}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-luxury-ivory border border-luxury-beige p-8 mb-8">
          <h2 className="text-2xl font-light text-luxury-charcoal mb-6 tracking-wide">
            GÓP Ý
          </h2>
          <p className="text-luxury-brown font-light mb-6">
            Thanh toán của bạn không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-luxury-taupe flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-luxury-brown font-light text-sm">
                Kiểm tra lại thông tin tài khoản thanh toán
              </span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-luxury-taupe flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-luxury-brown font-light text-sm">
                Đảm bảo tài khoản có đủ số dư
              </span>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-luxury-taupe flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-luxury-brown font-light text-sm">
                Thử lại với phương thức thanh toán khác (COD, MoMo, VNPay)
              </span>
            </div>
          </div>
        </div>

        {}
        <div className="flex gap-4 justify-center">
          <Link
            to="/cart"
            className="border-2 border-luxury-charcoal text-luxury-charcoal px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-charcoal hover:text-white transition-all duration-300"
          >
            QUAY LẠI GIỎ HÀNG
          </Link>
          <Link
            to="/checkout"
            className="bg-luxury-charcoal text-white px-8 py-4 text-sm font-light tracking-wider hover:bg-luxury-brown transition-all duration-300"
          >
            THỬ LẠI
          </Link>
        </div>

        {}
        <div className="mt-12 bg-luxury-ivory border border-luxury-beige p-6 text-center">
          <h3 className="text-lg font-light text-luxury-charcoal mb-4">Cần hỗ trợ?</h3>
          <p className="text-luxury-brown font-light text-sm mb-4">
            Nếu bạn gặp vấn đề với thanh toán, vui lòng liên hệ với chúng tôi:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href="tel:0901234567" className="flex items-center gap-2 text-luxury-charcoal hover:text-luxury-taupe transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-light">0901234567</span>
            </a>
            <a href="mailto:support@hmjewelry.com" className="flex items-center gap-2 text-luxury-charcoal hover:text-luxury-taupe transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-light">support@hmjewelry.com</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;
