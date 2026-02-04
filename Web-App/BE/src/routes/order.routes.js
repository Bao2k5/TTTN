// src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate.middleware');

// Tạo đơn hàng
router.post('/', verifyToken, [body('address').isLength({ min: 5 })], handleValidation, orderController.createOrder);

// Lấy danh sách đơn hàng
router.get('/', verifyToken, orderController.getOrders);

// Lấy chi tiết đơn hàng
router.get('/:id', verifyToken, orderController.getOrderById);

// Admin cập nhật trạng thái đơn hàng
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);

// Xác nhận thanh toán COD (mock)
router.post('/:id/pay', verifyToken, orderController.mockPayment);

module.exports = router;
