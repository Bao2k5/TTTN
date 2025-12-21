// src/controllers/vnpay.controller.js
const crypto = require('crypto');
const querystring = require('querystring');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

// VNPay configuration
const VNPAY_CONFIG = {
    tmnCode: process.env.VNPAY_TMN_CODE || 'GGPAFZ7E',
    hashSecret: process.env.VNPAY_HASH_SECRET || '44WBV76VZDN6GJEC7CDSEJE6RJ17BJRC',
    url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'https://hmjewelry.vercel.app/payment/vnpay/return',
    ipnUrl: process.env.VNPAY_IPN_URL || 'https://hmjewelry-be.vercel.app/api/payment/vnpay/ipn',
};

// Simple sort function - do NOT encode values
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
        sorted[key] = obj[key];
    });
    return sorted;
}

// Create VNPay payment
exports.createPayment = async (req, res) => {
    try {
        const { orderId, bankCode } = req.body;

        const order = await Order.findById(orderId).populate('items.product');
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        if (order.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Forbidden' });

        process.env.TZ = 'Asia/Ho_Chi_Minh';

        const date = new Date();
        const createDate = date.getFullYear().toString() +
            String(date.getMonth() + 1).padStart(2, '0') +
            String(date.getDate()).padStart(2, '0') +
            String(date.getHours()).padStart(2, '0') +
            String(date.getMinutes()).padStart(2, '0') +
            String(date.getSeconds()).padStart(2, '0');

        const ipAddr = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

        const tmnCode = VNPAY_CONFIG.tmnCode;
        const secretKey = VNPAY_CONFIG.hashSecret;
        const vnpUrl = VNPAY_CONFIG.url;
        const returnUrl = VNPAY_CONFIG.returnUrl;

        const orderId_vnp = `${orderId}_${String(date.getDate()).padStart(2, '0')}${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
        const amount = Math.floor(order.total);

        let vnp_Params = {
            vnp_Version: '2.1.0',
            vnp_Command: 'pay',
            vnp_TmnCode: tmnCode,
            vnp_Locale: 'vn',
            vnp_CurrCode: 'VND',
            vnp_TxnRef: orderId_vnp,
            vnp_OrderInfo: 'Thanh toan cho ma GD:' + orderId,
            vnp_OrderType: 'other',
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: ipAddr,
            vnp_CreateDate: createDate,
        };

        if (bankCode) {
            vnp_Params.vnp_BankCode = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);

        const signData = querystring.stringify(vnp_Params, { encode: false });
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params.vnp_SecureHash = signed;
        const paymentUrl = vnpUrl + '?' + querystring.stringify(vnp_Params, { encode: false });

        order.payment = {
            method: 'vnpay',
            status: 'pending',
            gatewayOrderId: orderId_vnp,
        };
        await order.save();

        res.json({
            success: true,
            payUrl: paymentUrl,
            requestId: orderId_vnp,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
