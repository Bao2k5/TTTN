const Order = require('../models/order.model');

const SEPAY_API_KEY = process.env.SEPAY_API_KEY || '';

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

    console.log('Order ID:', orderId);
    console.log('Amount:', transferAmount);

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
