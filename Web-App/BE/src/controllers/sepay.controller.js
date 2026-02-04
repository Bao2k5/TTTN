// src/controllers/sepay.controller.js
// Tích hợp SePay - Tự động xác nhận thanh toán chuyển khoản

const Order = require('../models/order.model');

/**
 * SePay Webhook Documentation:
 * - Đăng ký tại: https://my.sepay.vn
 * - Liên kết tài khoản ngân hàng (MB Bank)
 * - Cấu hình Webhook URL: https://hm-jewelry-api.onrender.com/api/payment/sepay/webhook
 * - SePay sẽ gọi webhook mỗi khi có giao dịch mới
 */

// Secret key từ SePay (cấu hình trong .env)
const SEPAY_API_KEY = process.env.SEPAY_API_KEY || '';

// @desc    Webhook nhận thông báo giao dịch từ SePay
// @route   POST /api/payment/sepay/webhook
// @access  Public (nhưng verify bằng API key)
exports.handleWebhook = async (req, res) => {
  try {
    console.log('=== SEPAY WEBHOOK RECEIVED ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Verify API Key từ SePay
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader?.replace('Apikey ', '') || req.headers['x-api-key'];
    
    if (SEPAY_API_KEY && apiKey !== SEPAY_API_KEY) {
      console.log('Invalid API Key');
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    /**
     * SePay gửi dữ liệu dạng:
     * {
     *   "id": 123456,
     *   "gateway": "MBBank",
     *   "transactionDate": "2024-01-15 10:30:00",
     *   "accountNumber": "0375225749",
     *   "code": null,
     *   "content": "HM67890ABCDEF thanh toan don hang",
     *   "transferType": "in",
     *   "transferAmount": 500000,
     *   "accumulated": 1500000,
     *   "subAccount": null,
     *   "referenceCode": "FT24015...",
     *   "description": "..."
     * }
     */

    const {
      id: transactionId,
      gateway,
      transactionDate,
      accountNumber,
      content,
      transferType,
      transferAmount,
      referenceCode
    } = req.body;

    // Chỉ xử lý giao dịch tiền VÀO
    if (transferType !== 'in') {
      console.log('Ignoring outgoing transaction');
      return res.json({ success: true, message: 'Ignored - outgoing transaction' });
    }

    // Tìm Order ID từ nội dung chuyển khoản
    // Format: HM + orderId (VD: HM67890ABCDEF)
    const orderIdMatch = content?.match(/HM([A-Z0-9]+)/i);
    
    if (!orderIdMatch) {
      console.log('No order ID found in content:', content);
      return res.json({ 
        success: true, 
        message: 'No order ID found',
        note: 'Giao dịch không chứa mã đơn hàng HMxxxxxx'
      });
    }

    const orderId = orderIdMatch[1];
    console.log('Extracted Order ID:', orderId);

    // Tìm đơn hàng trong database
    const order = await Order.findById(orderId);

    if (!order) {
      console.log('Order not found:', orderId);
      return res.json({ 
        success: false, 
        message: 'Order not found',
        orderId 
      });
    }

    // Kiểm tra số tiền
    const orderTotal = order.total;
    
    if (transferAmount < orderTotal) {
      console.log(`Amount mismatch: received ${transferAmount}, expected ${orderTotal}`);
      
      // Vẫn ghi nhận nhưng đánh dấu partial
      order.payment.status = 'pending';
      order.paymentEvents = order.paymentEvents || [];
      order.paymentEvents.push({
        eventType: 'webhook',
        provider: 'sepay',
        transactionId: String(transactionId),
        resultCode: 'partial',
        rawData: req.body
      });
      await order.save();

      return res.json({
        success: true,
        message: 'Partial payment received',
        orderId,
        receivedAmount: transferAmount,
        expectedAmount: orderTotal
      });
    }

    // Cập nhật trạng thái đơn hàng -> Đã thanh toán
    order.payment.status = 'paid';
    order.payment.gateway = 'manual';
    order.payment.transactionId = String(transactionId);
    order.payment.gatewayTransactionId = referenceCode;
    order.payment.paidAt = new Date();
    order.payment.amount = transferAmount;
    order.payment.gatewayResponse = {
      sepayId: transactionId,
      gateway: gateway,
      transactionDate,
      content,
      note: 'Tự động xác nhận qua SePay webhook'
    };
    
    order.status = 'processing'; // Chuyển sang đang xử lý
    
    // Ghi log event
    order.paymentEvents = order.paymentEvents || [];
    order.paymentEvents.push({
      eventType: 'webhook',
      provider: 'sepay',
      transactionId: String(transactionId),
      resultCode: 'success',
      rawData: req.body
    });
    
    await order.save();

    console.log('=== ORDER CONFIRMED ===');
    console.log('Order ID:', orderId);
    console.log('Amount:', transferAmount);

    // TODO: Gửi email/SMS thông báo cho khách hàng
    // TODO: Gửi Socket.IO event để cập nhật realtime

    res.json({
      success: true,
      message: 'Payment confirmed',
      orderId,
      amount: transferAmount,
      status: 'paid'
    });

  } catch (error) {
    console.error('SePay Webhook Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// @desc    Kiểm tra trạng thái thanh toán của đơn hàng
// @route   GET /api/payment/sepay/check/:orderId
// @access  Public
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId).select('payment status total');
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Đơn hàng không tồn tại' 
      });
    }

    res.json({
      success: true,
      data: {
        orderId,
        paymentStatus: order.payment?.status || 'pending',
        orderStatus: order.status,
        totalPrice: order.total,
        paidAt: order.payment?.paidAt || null
      }
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Test webhook (for debugging)
// @route   POST /api/payment/sepay/test-webhook
// @access  Private (Admin only in production)
exports.testWebhook = async (req, res) => {
  try {
    const testPayload = {
      id: Date.now(),
      gateway: "MBBank",
      transactionDate: new Date().toISOString(),
      accountNumber: "0375225749",
      content: req.body.content || "HM123456TEST thanh toan",
      transferType: "in",
      transferAmount: req.body.amount || 500000,
      referenceCode: `FT${Date.now()}`
    };

    console.log('Test webhook payload:', testPayload);

    // Gọi lại chính handler này
    req.body = testPayload;
    return this.handleWebhook(req, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
