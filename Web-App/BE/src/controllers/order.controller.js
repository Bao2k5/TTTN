const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const sendEmail = require("../utils/email");

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        msg: 'Gio hang trong. Vui long them san pham truoc khi dat hang.',
        error: 'CART_EMPTY'
      });
    }

    let total = 0;
    const items = cart.items.map(i => {
      if (!i.product) {
        throw new Error('San pham trong gio hang khong ton tai');
      }
      const price = i.product.priceSale || i.product.price || 0;
      total += price * i.qty;
      return { product: i.product._id, qty: i.qty, price };
    });

    const paymentMethod = req.body.paymentMethod || 'cod';
    const discount = req.body.discount || 0;
    const finalTotal = total - discount;

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

    if (!req.body.useStripe) {
      for (const it of items) {
        await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
      }
      order.stockAdjusted = true;
      await order.save();
    }

    await Cart.findOneAndDelete({ user: req.user.id });

    const emailPromise = async () => {
      try {
        const message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #4A4A4A; text-align: center;">Cam on ban da dat hang tai HM Jewelry!</h2>
            <p>Xin chao <strong>${order.fullName}</strong>,</p>
            <p>Don hang cua ban da duoc tiep nhan va dang duoc xu ly.</p>
            <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #B76E79;">Thong tin don hang #${order._id.toString().slice(-6).toUpperCase()}</h3>
              <p><strong>Tong tien:</strong> ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</p>
              <p><strong>Phuong thuc thanh toan:</strong> ${order.payment.method === 'cod' ? 'Thanh toan khi nhan hang (COD)' : 'Chuyen khoan'}</p>
              <p><strong>Dia chi giao hang:</strong> ${order.address}</p>
            </div>
          </div>
        `;
        await sendEmail({
          email: order.email,
          subject: 'Xac nhan don hang - HM Jewelry',
          message
        });
      } catch (emailError) {
        console.error('Email send failed:', emailError.message);
      }
    };

    emailPromise();
    
    res.status(201).json({
      success: true,
      message: 'Dat hang thanh cong',
      ...order.toObject()
    });
  } catch (err) {
    console.error('[createOrder] Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      msg: 'Dat hang that bai. Vui long thu lai sau.'
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
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Forbidden' });
    }
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
    res.status(500).json({ error: err.message });
  }
};
