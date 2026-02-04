// src/routes/index.js
const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const productRoutes = require("./product.routes");
const collectionRoutes = require("./collection.routes");
const promoRoutes = require("./promo.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");
const adminRoutes = require('./admin.routes');
const uploadRoutes = require('./upload.routes');
const partnerRoutes = require('./partner.routes');
const heroBannerRoutes = require('./heroBanner.routes');
const paymentRoutes = require('./payment.routes');
const addressRoutes = require('./address.routes');
const couponRoutes = require('./coupon.routes');
const vietqrRoutes = require('./vietqr.routes');

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/collections", collectionRoutes);
router.use("/promos", promoRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/partners', partnerRoutes);
router.use('/hero-banners', heroBannerRoutes);
router.use('/payment', paymentRoutes);
router.use('/address', addressRoutes);
router.use('/coupons', couponRoutes);
router.use('/payment/vietqr', vietqrRoutes);
router.use('/contact', require('./contact.routes'));

module.exports = router;
