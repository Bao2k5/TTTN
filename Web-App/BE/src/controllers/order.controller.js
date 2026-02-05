// src/controllers/order.controller.js
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const sendEmail = require("../utils/email");

exports.createOrder = async (req, res) => {
  try {
    console.log('[createOrder] Request body:', JSON.stringify(req.body, null, 2));
    console.log('[createOrder] User:', req.user);

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    console.log('[createOrder] Cart found:', cart ? `${cart.items.length} items` : 'No cart');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.',
        error: 'CART_EMPTY'
      });
    }

    // Tính tổng tiền đơn hàng
    let total = 0;
    const items = cart.items.map(i => {
      if (!i.product) {
        console.error('[createOrder] Product not found in cart item:', i);
        throw new Error('Sản phẩm trong giỏ hàng không tồn tại');
      }
      const price = i.product.priceSale || i.product.price || 0;
      total += price * i.qty;
      return { product: i.product._id, qty: i.qty, price };
    });

    console.log('[createOrder] Order items:', items);
    console.log('[createOrder] Total:', total);

    const paymentMethod = req.body.paymentMethod || 'cod';
    
    // Tính discount nếu có coupon
    const discount = req.body.discount || 0;
    const finalTotal = total - discount;

    // Map payment method to gateway
    let gateway = 'none';
    if (paymentMethod === 'cod') {
      gateway = 'none';
    } else if (paymentMethod === 'bank_transfer' || paymentMethod === 'vietqr') {
      gateway = 'vietqr';
    } else {
      gateway = paymentMethod;
    }

    const order = await Order.create({
      user: req.user.id,
      items,
      total: finalTotal,
      address: req.body.address || req.body.shippingAddress || '',
      phone: req.body.phone || '',
      email: req.body.email || req.user.email || '',
      fullName: req.body.fullName || req.user.name || '',
      note: req.body.note || '',
      couponCode: req.body.couponCode || null,
      discount: discount,
      payment: {
        method: paymentMethod,
        status: 'pending',
        gateway: gateway,
        amount: finalTotal,
        currency: 'VND'
      }
    });

    console.log('[createOrder] Order created:', order._id);

    // Trừ tồn kho (chỉ áp dụng cho đơn COD, đơn Stripe sẽ trừ sau khi thanh toán thành công)
    if (!req.body.useStripe) {
      for (const it of items) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
      }
      order.stockAdjusted = true;
      await order.save();
    }

    // Xóa giỏ hàng sau khi đặt thành công
    await Cart.findOneAndDelete({ user: req.user.id });
    console.log('[createOrder] Cart cleared');

    // Gửi email xác nhận cho khách
    try {
      const message = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4A4A4A; text-align: center;">Cảm ơn bạn đã đặt hàng tại HM Jewelry!</h2>
          <p>Xin chào <strong>${order.fullName}</strong>,</p>
          <p>Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #B76E79;">Thông tin đơn hàng #${order._id.toString().slice(-6).toUpperCase()}</h3>
            <p><strong>Tổng tiền:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</p>
            <p><strong>Phương thức thanh toán:</strong> ${order.payment.method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'VNPay'}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${order.address}</p>
          </div>

          <h3>Chi tiết sản phẩm:</h3>
          <ul style="list-style: none; padding: 0;">
            ${items.map(item => `
              <li style="border-bottom: 1px solid #eee; padding: 10px 0; display: flex; justify-content: space-between;">
                <span>${item.qty}x Sản phẩm (ID: ${item.product})</span>
                <span>${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `;

      await sendEmail({
        email: order.email,
        subject: 'Xác nhận đơn hàng - HM Jewelry',
        message
      });
    } catch (emailError) {
      console.error('Email send failed:', emailError);
      // Không throw error để đơn hàng vẫn thành công
    }
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công',
      ...order.toObject()
    });
  } catch (err) {
    console.error('[createOrder] Error:', err);
    console.error('[createOrder] Stack:', err.stack);
    res.status(500).json({
      success: false,
      error: err.message,
      msg: 'Đặt hàng thất bại. Vui lòng thử lại sau.'
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const orders = await Order.find().sort('-createdAt');
      return res.json(orders);
    }
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Not found' });
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Not found' });
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Giả lập thanh toán (dùng cho demo)
exports.mockPayment = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          'payment.method': 'mock',
          'payment.status': 'paid',
          'payment.gateway': 'mock',
          'payment.transactionId': 'MOCK-' + Date.now(),
          'payment.paidAt': new Date(),
          status: 'paid'
        }
      },
      { new: true, runValidators: false }
    );

    if (!order) return res.status(404).json({ msg: 'Not found' });
    res.json(order);
  } catch (err) {
    console.error('Mock payment error:', err);
    res.status(500).json({ error: err.message });
  }
};
