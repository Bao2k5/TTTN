// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// GET /api/users/profile
router.get("/profile", verifyToken, userController.getProfile);

// PUT /api/users/profile
router.put("/profile", verifyToken, userController.updateProfile);
router.post('/change-password', verifyToken, userController.changePassword);

// addresses
router.post('/addresses', verifyToken, userController.addAddress);
router.put('/addresses/:index', verifyToken, userController.updateAddress);
router.delete('/addresses/:index', verifyToken, userController.deleteAddress);

// Wishlist
const wishlistController = require('../controllers/wishlist.controller');
router.get('/wishlist', verifyToken, wishlistController.getWishlist);
router.post('/wishlist', verifyToken, wishlistController.addToWishlist);
router.delete('/wishlist/:productId', verifyToken, wishlistController.removeFromWishlist);

module.exports = router;
