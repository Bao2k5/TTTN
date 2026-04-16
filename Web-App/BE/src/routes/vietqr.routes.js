// src/routes/vietqr.routes.js
const express = require('express');
const router = express.Router();
const vietqrController = require('../controllers/vietqr.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// ========== VIETQR (BIDV Bank Transfer) ==========
// Generate QR code for bank payment (yêu cầu đăng nhập)
router.post('/generate', verifyToken, vietqrController.generateQR);

// Get list of supported banks
router.get('/banks', vietqrController.getBanks);

// Get current bank config
router.get('/config', vietqrController.getBankConfig);

// Verify payment (manual or webhook)
router.post('/verify', vietqrController.verifyPayment);

// Get all payment config
router.get('/all-config', vietqrController.getAllPaymentConfig);

module.exports = router;
