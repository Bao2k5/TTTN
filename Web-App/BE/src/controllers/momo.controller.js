// src/controllers/momo.controller.js
const crypto = require('crypto');
const https = require('https');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const { buildMomoSignature, verifyMomoIpnSignature } = require('../utils/momo');

// MoMo configuration (replace with your credentials)
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMOBKUN20180529',
  accessKey: process.env.MOMO_ACCESS_KEY || 'klm05TvNBzhg7h7j',
  secretKey: process.env.MOMO_SECRET_KEY || 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  // SANDBOX: Redirect to simulator page instead of direct callback
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/payment/momo/simulator',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:5000/api/payment/momo/ipn',
};

// Create MoMo payment
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Get order from DB
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });

    // Generate request ID
    const requestId = `${orderId}_${Date.now()}`;
    const orderInfo = `Payment for order ${orderId}`;
    const amount = order.total.toString();
    const orderIdStr = orderId.toString();

    // Build signature using utility function
    const payload = {
      accessKey: MOMO_CONFIG.accessKey,
      amount: amount,
      extraData: '',
      ipnUrl: MOMO_CONFIG.ipnUrl,
      orderId: orderIdStr,
      orderInfo: orderInfo,
      partnerCode: MOMO_CONFIG.partnerCode,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      requestId: requestId,
      requestType: 'captureWallet',
    };
    const signature = buildMomoSignature(payload, MOMO_CONFIG.secretKey);

    // Request body
    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderIdStr,
      orderInfo: orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      extraData: '',
      requestType: 'captureWallet',
      signature: signature,
      lang: 'vi',
    };

    // Send request to MoMo
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const momoRequest = https.request(MOMO_CONFIG.endpoint, options, (momoRes) => {
      let data = '';
      momoRes.on('data', (chunk) => {
        data += chunk;
      });
      momoRes.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.resultCode === 0) {
            // Update order with MoMo info
            order.payment = {
              method: 'momo',
              status: 'pending',
              requestId: requestId,
            };
            order.save();
            
            res.json({
              success: true,
              payUrl: response.payUrl,
              requestId: requestId,
            });
          } else {
            res.status(400).json({ msg: 'MoMo payment creation failed', error: response });
          }
        } catch (err) {
          res.status(500).json({ error: 'Failed to parse MoMo response' });
        }
      });
    });

    momoRequest.on('error', (err) => {
      res.status(500).json({ error: err.message });
    });

    momoRequest.write(JSON.stringify(requestBody));
    momoRequest.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MoMo IPN callback (webhook)
exports.ipnCallback = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // 1. Verify signature using utility function
    const isValidSignature = verifyMomoIpnSignature(req.body, MOMO_CONFIG.secretKey);
    if (!isValidSignature) {
      console.error('[MoMo IPN] Invalid signature');
      return res.status(400).json({ msg: 'Invalid signature' });
    }

    // 2. Find order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('[MoMo IPN] Order not found:', orderId);
      return res.status(404).json({ msg: 'Order not found' });
    }

    // 3. Idempotency check - prevent double processing
    const existingEvent = order.paymentEvents?.find(
      e => e.provider === 'momo' && e.transactionId === transId
    );
    if (existingEvent) {
      console.log('[MoMo IPN] Duplicate event ignored:', transId);
      return res.status(204).end(); // Already processed
    }

    // 4. Amount validation - CRITICAL security check
    const expectedAmount = Math.round(order.total);
    const receivedAmount = parseInt(amount);
    if (receivedAmount !== expectedAmount) {
      console.error('[MoMo IPN] Amount mismatch:', {
        expected: expectedAmount,
        received: receivedAmount,
        orderId
      });
      return res.status(400).json({ msg: 'Amount mismatch' });
    }

    // 5. Log payment event for idempotency
    order.paymentEvents = order.paymentEvents || [];
    order.paymentEvents.push({
      eventType: 'ipn',
      provider: 'momo',
      transactionId: transId,
      resultCode: String(resultCode),
      receivedAt: new Date(),
      rawData: req.body
    });

    // 6. Update order status based on result
    if (resultCode === 0) {
      // Payment successful
      order.payment.status = 'paid';
      order.payment.transactionId = transId;
      order.payment.gatewayTransactionId = transId;
      order.payment.paidAt = new Date();
      order.status = 'paid';
      
      // Decrement stock if not already done
      if (!order.stockAdjusted) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
        }
        order.stockAdjusted = true;
        console.log('[MoMo IPN] Stock adjusted for order:', orderId);
      }
    } else {
      // Payment failed
      order.payment.status = 'failed';
      order.status = 'cancelled';
      console.log('[MoMo IPN] Payment failed:', { orderId, resultCode, message });
    }

    await order.save();
    console.log('[MoMo IPN] Order updated successfully:', orderId);
    
    res.status(204).end(); // MoMo expects 204 No Content
  } catch (err) {
    console.error('[MoMo IPN] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Query payment status from MoMo (active verification)
exports.queryPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    // Get order from DB
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });

    const requestId = order.payment.requestId;
    if (!requestId) return res.status(400).json({ msg: 'No payment request found' });

    // Create raw signature for query
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&orderId=${orderId}&partnerCode=${MOMO_CONFIG.partnerCode}&requestId=${requestId}`;
    
    const signature = crypto
      .createHmac('sha256', MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest('hex');

    // Request body for query
    const requestBody = {
      partnerCode: MOMO_CONFIG.partnerCode,
      accessKey: MOMO_CONFIG.accessKey,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'vi',
    };

    // Query endpoint
    const queryEndpoint = process.env.MOMO_QUERY_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/query';

    // Send query request to MoMo
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const momoRequest = https.request(queryEndpoint, options, (momoRes) => {
      let data = '';
      momoRes.on('data', (chunk) => {
        data += chunk;
      });
      momoRes.on('end', async () => {
        try {
          const response = JSON.parse(data);
          
          // Update order based on query result
          if (response.resultCode === 0) {
            // Payment successful
            order.payment.status = 'paid';
            order.payment.transactionId = response.transId;
            order.status = 'paid';
            
            // Decrement stock if not already done
            if (!order.stockAdjusted) {
              for (const item of order.items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
              }
              order.stockAdjusted = true;
            }
            
            await order.save();
            res.json({ success: true, status: 'paid', order });
          } else if (response.resultCode === 1000) {
            // Transaction not found or pending
            res.json({ success: true, status: 'pending', message: response.message });
          } else {
            // Payment failed
            order.payment.status = 'failed';
            order.status = 'cancelled';
            await order.save();
            res.json({ success: true, status: 'failed', message: response.message });
          }
        } catch (err) {
          res.status(500).json({ error: 'Failed to parse MoMo query response' });
        }
      });
    });

    momoRequest.on('error', (err) => {
      res.status(500).json({ error: err.message });
    });

    momoRequest.write(JSON.stringify(requestBody));
    momoRequest.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Handle redirect from MoMo (user returns to site)
exports.handleCallback = async (req, res) => {
  try {
    const { orderId, resultCode, message } = req.query;
    
    // Just redirect to frontend, let frontend query status actively
    if (resultCode === '0') {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?orderId=${orderId}`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel?orderId=${orderId}&msg=${encodeURIComponent(message)}`);
    }
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/error?msg=${encodeURIComponent(err.message)}`);
  }
};

// SANDBOX ONLY: Simulate MoMo callback from frontend
exports.simulateCallback = async (req, res) => {
  try {
    const { orderId, requestId, amount, resultCode, message } = req.body;
    
    console.log('[MoMo Simulator] Simulating callback for order:', orderId);
    
    // Find order
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Build fake IPN data that matches real MoMo format
    const fakeTransId = `MOMO_SIMULATE_${Date.now()}`;
    const ipnData = {
      partnerCode: MOMO_CONFIG.partnerCode,
      orderId: orderId.toString(),
      requestId: requestId || `${orderId}_${Date.now()}`,
      amount: amount || Math.round(order.total).toString(),
      orderInfo: `Payment for order ${orderId}`,
      orderType: 'momo_wallet',
      transId: fakeTransId,
      resultCode: parseInt(resultCode) || 0,
      message: message || 'Successful.',
      payType: 'qr',
      responseTime: Date.now(),
      extraData: '',
      // Note: Signature validation skipped in simulator
    };

    // Call the IPN handler directly
    // Create a mock request/response to pass to ipnCallback
    const mockReq = { body: ipnData };
    const mockRes = {
      status: (code) => ({
        json: (data) => {
          console.log('[MoMo Simulator] IPN handler response:', code, data);
          return { code, data };
        },
        send: () => {
          console.log('[MoMo Simulator] IPN handler response:', code);
          return { code };
        }
      }),
      sendStatus: (code) => {
        console.log('[MoMo Simulator] IPN handler sendStatus:', code);
        return { code };
      }
    };

    // Process the simulated callback
    if (ipnData.resultCode === 0) {
      // Check idempotency
      if (order.paymentEvents?.some(e => e.provider === 'momo' && e.transactionId === fakeTransId)) {
        console.log('[MoMo Simulator] Duplicate transaction - idempotency caught');
        return res.status(200).json({ 
          success: true, 
          message: 'Duplicate transaction (idempotency)', 
          order 
        });
      }

      // Log event
      if (!order.paymentEvents) order.paymentEvents = [];
      order.paymentEvents.push({
        eventType: 'ipn',
        provider: 'momo',
        transactionId: fakeTransId,
        resultCode: '0',
        rawData: ipnData
      });

      // Update order status
      order.payment.status = 'paid';
      order.payment.transactionId = fakeTransId;
      order.payment.paidAt = new Date();
      order.status = 'paid';

      // Decrement stock if not already done
      if (!order.stockAdjusted) {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
        }
        order.stockAdjusted = true;
      }

      await order.save();
      
      console.log('[MoMo Simulator] Payment successful, order updated');
      return res.json({ 
        success: true, 
        message: 'Payment simulated successfully', 
        order 
      });
    } else {
      // Failed payment
      order.payment.status = 'failed';
      order.status = 'cancelled';
      await order.save();
      
      console.log('[MoMo Simulator] Payment failed simulation');
      return res.json({ 
        success: true, 
        message: 'Payment failure simulated', 
        order 
      });
    }
  } catch (err) {
    console.error('[MoMo Simulator] Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
