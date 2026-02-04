// src/routes/vietqr.routes.js
const express = require('express');
const router = express.Router();
const vietqrController = require('../controllers/vietqr.controller');

// ========== VIETQR (Bank Transfer) ==========
// Generate QR code for bank payment
router.post('/generate', vietqrController.generateQR);

// Get list of supported banks
router.get('/banks', vietqrController.getBanks);

// Get current bank config
router.get('/config', vietqrController.getBankConfig);

// Verify payment (manual or webhook)
router.post('/verify', vietqrController.verifyPayment);

// ========== MOMO ==========
// Generate MoMo payment info
router.post('/momo/generate', vietqrController.generateMoMoQR);

// ========== ALL PAYMENT CONFIG ==========
router.get('/all-config', vietqrController.getAllPaymentConfig);

module.exports = router;
