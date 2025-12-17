// src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const paymentController = require('../controllers/payment.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate.middleware');

router.post('/', verifyToken, [body('address').isLength({ min: 5 })], handleValidation, orderController.createOrder);
// create payment intent (Stripe)
router.post('/create-payment-intent', verifyToken, paymentController.createPaymentIntent);
router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
// admin update status
router.put('/:id/status', verifyToken, isAdmin, orderController.updateOrderStatus);
// mock payment endpoint
router.post('/:id/pay', verifyToken, orderController.mockPayment);

// Stripe webhook moved to app.js (before express.json() middleware)
// router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

module.exports = router;
