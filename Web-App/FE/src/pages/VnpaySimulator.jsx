import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paymentService from '../services/paymentService';

const VnpaySimulator = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  const orderId = searchParams.get('orderId');
  const txnRef = searchParams.get('vnp_TxnRef');
  const amount = searchParams.get('vnp_Amount');

  useEffect(() => {
    if (orderId && amount) {

      const amountInVnd = parseInt(amount) / 100;
      setOrderInfo({
        orderId,
        txnRef: txnRef || orderId,
        amount: amountInVnd,
        formattedAmount: new Intl.NumberFormat('vi-VN').format(amountInVnd) + 'đ'
      });
    }
  }, [orderId, txnRef, amount]);

  const handleSimulateSuccess = async () => {
    if (!orderId) {
      alert('Thiếu thông tin đơn hàng!');
      return;
    }

    setLoading(true);
    try {

      const response = await paymentService.simulateVnpayCallback({
        orderId,
        txnRef: txnRef || orderId,
        amount,
        responseCode: '00', // 00 = success
        transactionStatus: '00'
      });

      if (response.success) {

        navigate(`/payment/success?orderId=${orderId}&provider=vnpay&vnp_ResponseCode=00`);
      } else {
        alert('Lỗi khi giả lập thanh toán: ' + (response.message || 'Unknown error'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Simulate VNPay error:', error);
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleSimulateFailure = async () => {
    if (!orderId) {
      alert('Thiếu thông tin đơn hàng!');
      return;
    }

    setLoading(true);
    try {
      const response = await paymentService.simulateVnpayCallback({
        orderId,
        txnRef: txnRef || orderId,
        amount,
        responseCode: '24', // 24 = transaction cancelled
        transactionStatus: '02'
      });

      navigate(`/payment/cancel?orderId=${orderId}&provider=vnpay&vnp_ResponseCode=24`);
    } catch (error) {
      console.error('Simulate VNPay error:', error);
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/payment/cancel?orderId=${orderId}&provider=vnpay`);
  };

  if (!orderInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        { }
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 rounded-xl mb-4">
            <span className="text-white text-2xl font-bold">VNPAY</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">VNPay Sandbox Simulator</h1>
          <p className="text-gray-600">Chế độ test - Không thanh toán thật</p>
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
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">{orderInfo.txnRef}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Số tiền:</span>
                <span className="text-2xl font-bold text-blue-600">{orderInfo.formattedAmount}</span>
              </div>
            </div>
          </div>

          { }
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-8 mb-6">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 inline-block mb-4">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-600">ATM</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-2xl">💳</span>
                    </div>
                    <span className="text-xs text-gray-600">Visa/Master</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-2xl">🏦</span>
                    </div>
                    <span className="text-xs text-gray-600">Internet Banking</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold mb-2">
                  SANDBOX MODE
                </span>
                <br />
                Trong môi trường thật, bạn sẽ chọn phương thức và nhập thông tin thẻ
              </p>
            </div>
          </div>

          { }
          <div className="space-y-3">
            <button
              onClick={handleSimulateSuccess}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
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

            <button
              onClick={handleCancel}
              disabled={loading}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy thanh toán
            </button>
          </div>
        </div>

        { }
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Hướng dẫn test:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Nhấn nút xanh để giả lập thanh toán thành công</li>
                <li>Nhấn nút đỏ để giả lập thanh toán thất bại</li>
                <li>Hệ thống sẽ tự động gọi IPN callback về backend</li>
                <li>Kiểm tra console backend để xem log xử lý</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VnpaySimulator;
