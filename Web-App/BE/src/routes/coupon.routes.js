// src/routes/coupon.routes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon.controller');
const { verifyToken, isAdmin, optionalAuth } = require('../middleware/auth.middleware');

// Public/User routes (optionalAuth - không bắt buộc login)
router.post('/apply', optionalAuth, couponController.applyCoupon);
router.post('/use', verifyToken, couponController.useCoupon);

// Admin routes
router.get('/', verifyToken, isAdmin, couponController.getAllCoupons);
router.post('/', verifyToken, isAdmin, couponController.createCoupon);
router.put('/:id', verifyToken, isAdmin, couponController.updateCoupon);
router.delete('/:id', verifyToken, isAdmin, couponController.deleteCoupon);

module.exports = router;
