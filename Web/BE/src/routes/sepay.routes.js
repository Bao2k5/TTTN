// src/routes/sepay.routes.js
// Routes cho SePay - Tự động xác nhận thanh toán

const express = require('express');
const router = express.Router();
const sepayController = require('../controllers/sepay.controller');

// Webhook từ SePay - Nhận thông báo giao dịch
router.post('/webhook', sepayController.handleWebhook);

// Kiểm tra trạng thái thanh toán
router.get('/check/:orderId', sepayController.checkPaymentStatus);

// Test webhook (development only)
router.post('/test-webhook', sepayController.testWebhook);

module.exports = router;
