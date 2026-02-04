// src/models/order.model.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        qty: { type: Number, default: 1 },
        price: { type: Number, required: true }
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, enum: ["pending", "processing", "paid", "shipped", "completed", "cancelled"], default: "pending" },
    address: { type: String },
    shipping: {
      carrier: { type: String },
      trackingNumber: { type: String },
      cost: { type: Number, default: 0 }
    },
    payment: {
      method: { type: String, enum: ['stripe', 'momo', 'vnpay', 'cod', 'momo-manual', 'mock', 'bank_transfer', 'vietqr'], required: true },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partial'], default: 'pending' },
      transactionId: { type: String },
      gateway: { type: String, enum: ['stripe', 'momo', 'vnpay', 'manual', 'none', 'mock', 'sepay', 'vietqr'], default: 'none' },
      gatewayOrderId: { type: String }, // MoMo orderId, VNPay vnp_TxnRef
      gatewayTransactionId: { type: String }, // MoMo transId, VNPay vnp_TransactionNo
      paidAt: { type: Date },
      amount: { type: Number },
      currency: { type: String, default: 'VND' },
      gatewayResponse: { type: Object }, // Store raw gateway response for debugging
      ipnReceived: { type: Boolean, default: false },
      ipnReceivedAt: { type: Date }
    },
    // Idempotency guard: log all IPN/webhook events to prevent double-processing
    paymentEvents: [{
      eventType: { type: String }, // 'ipn', 'webhook', 'query'
      provider: { type: String }, // 'momo', 'vnpay', 'stripe'
      transactionId: { type: String },
      resultCode: { type: String },
      receivedAt: { type: Date, default: Date.now },
      rawData: { type: Object } // Store full event for debugging
    }],
    stockAdjusted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model("Order", orderSchema);
