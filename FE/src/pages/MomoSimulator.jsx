import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paymentService from '../services/paymentService';

const MomoSimulator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [payUrl, setPayUrl] = useState(null);
  const [isDevelopment] = useState(() => {
    // Kiểm tra xem có phải development mode không
    return import.meta.env.MODE === 'development' ||
      import.meta.env.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
  });

  const orderId = searchParams.get('orderId');
  const requestId = searchParams.get('requestId');
  const amount = searchParams.get('amount');
  const payUrlParam = searchParams.get('payUrl');

  // Fetch payUrl từ backend nếu chưa có
  useEffect(() => {
    if (orderId && !payUrlParam) {
      // Có thể fetch lại từ backend nếu cần
      // Nhưng tốt nhất là truyền payUrl từ Checkout
    } else if (payUrlParam) {
      setPayUrl(payUrlParam);
    }
  }, [orderId, payUrlParam]);

  useEffect(() => {
    if (orderId && amount) {
      setOrderInfo({
        orderId,
        requestId,
        amount: parseInt(amount),
        formattedAmount: new Intl.NumberFormat('vi-VN').format(parseInt(amount)) + 'đ'
      });
    }
  }, [orderId, requestId, amount]);

  const handleSimulateSuccess = async () => {
    if (!orderId || !requestId) {
      alert('Thiếu thông tin đơn hàng!');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.simulateMomoCallback({
        orderId,
        requestId,
        amount,
        resultCode: 0, // 0 = success
        message: 'Successful.'
      });

      // Nếu không có lỗi, chuyển hướng ngay
      // Backend sẽ trả về success: true hoặc throw error
      console.log('Simulate response:', response);

      // Chuyển hướng đến trang thành công
      navigate(`/payment/success?orderId=${orderId}&provider=momo&resultCode=0`);
    } catch (error) {
      console.error('Simulate MoMo error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Có lỗi xảy ra khi giả lập thanh toán';
      alert('Lỗi: ' + errorMessage);
      setLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!orderId || !requestId) {
      alert('Thiếu thông tin đơn hàng!');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.simulateMomoCallback({
        orderId,
        requestId,
        amount,
        resultCode: 1006, // 1006 = transaction failed
        message: 'Transaction failed'
      });

      console.log('Simulate failure response:', response);

      // Chuyển hướng đến trang hủy
      navigate(`/payment/cancel?orderId=${orderId}&provider=momo&resultCode=1006`);
    } catch (error) {
      console.error('Simulate MoMo error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Có lỗi xảy ra khi giả lập thanh toán';
      alert('Lỗi: ' + errorMessage);
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/payment/cancel?orderId=${orderId}&provider=momo`);
  };

  if (!orderInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        { }
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-600 rounded-full mb-4">
            <span className="text-white text-4xl font-bold">M</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {payUrl ? 'Thanh toán MoMo' : 'MoMo Sandbox Simulator'}
          </h1>
          <p className="text-gray-600">
            {payUrl ? 'Quét mã QR để thanh toán' : 'Chế độ test - Không thanh toán thật'}
          </p>
        </div>

        { }
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mã giao dịch:</span>
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">{requestId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Số tiền:</span>
                <span className="text-2xl font-bold text-pink-600">{orderInfo.formattedAmount}</span>
              </div>
            </div>
          </div>

          { }
          <div className="bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl p-8 mb-6">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 inline-block mb-4">
                {payUrl ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payUrl)}`}
                    alt="MoMo QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-3">
                {payUrl ? (
                  <>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold mb-2">
                      📱 Mã QR thanh toán
                    </span>
                    <br />
                    Mở app MoMo và quét mã QR để thanh toán
                  </>
                ) : (
                  <>
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold mb-2">
                      SANDBOX MODE
                    </span>
                    <br />
                    Trong môi trường thật, bạn sẽ quét mã QR này bằng app MoMo
                  </>
                )}
              </p>
              {payUrl && (
                <a
                  href={payUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm"
                >
                  Hoặc mở link thanh toán
                </a>
              )}
            </div>
          </div>

          { }
          {/* Chỉ hiển thị nút giả lập trong development mode */}
          {isDevelopment && (
            <div className="space-y-3 mb-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-yellow-800 text-xs font-semibold text-center">
                  ⚠️ CHẾ ĐỘ TEST - Các nút giả lập chỉ hiển thị trong development
                </p>
              </div>
              <button
                onClick={handleSimulateSuccess}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  'Giả lập thanh toán THÀNH CÔNG'
                )}
              </button>

              <button
                onClick={handleSimulateFailure}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Giả lập thanh toán THẤT BẠI
              </button>
            </div>
          )}

          <button
            onClick={handleCancel}
            disabled={loading}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy thanh toán
          </button>
        </div>

        { }
        {isDevelopment && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Hướng dẫn test (Development Mode):</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Nhấn nút xanh để giả lập thanh toán thành công</li>
                  <li>Nhấn nút đỏ để giả lập thanh toán thất bại</li>
                  <li>Hệ thống sẽ tự động gọi IPN callback về backend</li>
                  <li>Kiểm tra console backend để xem log xử lý</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {payUrl && !isDevelopment && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">📱 Hướng dẫn thanh toán:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Mở app MoMo trên điện thoại</li>
                  <li>Quét mã QR code ở trên</li>
                  <li>Xác nhận thanh toán trong app MoMo</li>
                  <li>Hệ thống sẽ tự động cập nhật trạng thái đơn hàng</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomoSimulator;
