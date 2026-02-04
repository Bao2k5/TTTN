// src/routes/coupon.routes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Public/User routes
router.post('/apply', couponController.applyCoupon);
router.post('/use', protect, couponController.useCoupon);

// Admin routes
router.get('/', protect, admin, couponController.getAllCoupons);
router.post('/', protect, admin, couponController.createCoupon);
router.put('/:id', protect, admin, couponController.updateCoupon);
router.delete('/:id', protect, admin, couponController.deleteCoupon);

module.exports = router;
