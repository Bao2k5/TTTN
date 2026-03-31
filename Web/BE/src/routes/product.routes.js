// src/routes/product.routes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken, isAdmin } = require("../middleware/auth.middleware");
const reviewRoutes = require('./review.routes');
const { body, query } = require('express-validator');
const { handleValidation } = require('../middleware/validate.middleware');

// public
router.get("/", productController.listProducts);
router.get("/search", productController.searchProducts);
router.get("/new-arrivals", productController.getNewArrivals);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id", productController.getProductById);

// nested reviews
router.use('/:productId/reviews', reviewRoutes);

// admin protected
router.post(
	"/",
	verifyToken,
	isAdmin,
	[body('name').isLength({ min: 2 }), body('price').isFloat({ gt: 0 })],
	handleValidation,
	productController.createProduct
);

router.put(
	"/:id",
	verifyToken,
	isAdmin,
	[body('name').optional().isLength({ min: 2 }), body('price').optional().isFloat({ gt: 0 })],
	handleValidation,
	productController.updateProduct
);

router.delete("/:id", verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
