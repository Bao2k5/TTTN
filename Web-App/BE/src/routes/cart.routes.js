// src/routes/cart.routes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate.middleware');

router.get('/', verifyToken, cartController.getCart);
router.post('/', verifyToken, [body('productId').isMongoId(), body('qty').optional().isInt({ min: 1 })], handleValidation, cartController.addItem);
router.put('/', verifyToken, [body('productId').isMongoId(), body('qty').isInt({ min: 0 })], handleValidation, cartController.updateItem);
router.delete('/', verifyToken, cartController.clearCart);

module.exports = router;
