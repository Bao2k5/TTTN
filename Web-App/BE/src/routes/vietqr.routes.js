// src/routes/vietqr.routes.js
const express = require('express');
const router = express.Router();
const vietqrController = require('../controllers/vietqr.controller');

// Generate QR code for payment
router.post('/generate', vietqrController.generateQR);

// Get list of supported banks
router.get('/banks', vietqrController.getBanks);

// Get current bank config
router.get('/config', vietqrController.getBankConfig);

// Verify payment (manual or webhook)
router.post('/verify', vietqrController.verifyPayment);

module.exports = router;
