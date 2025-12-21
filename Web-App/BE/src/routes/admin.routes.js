const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');
const { query, body } = require('express-validator');
const { handleValidation } = require('../middleware/validate.middleware');
const multer = require('multer');
const upload = multer();
const productController = require('../controllers/product.controller');

// Protect all admin routes
router.use(verifyToken, isAdmin);

// Users management
router.get('/users', [query('page').optional().isInt({ gt: 0 }), query('limit').optional().isInt({ gt: 0 })], handleValidation, adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id', [body('role').optional().isIn(['user','admin','seller']), body('emailVerified').optional().isBoolean()], handleValidation, adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Orders management
router.get('/orders', adminController.listOrders);
router.get('/orders/:id', adminController.getOrder);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.put('/orders/:id/ship', [body('carrier').optional().isString(), body('trackingNumber').optional().isString()], handleValidation, adminController.updateOrderShipping);

// bulk products update
router.post('/products/bulk-update', [body('list').isArray({ min: 1 })], handleValidation, adminController.bulkUpdateProducts);

// admin logs
router.get('/logs', adminController.listLogs || ((req,res)=>res.status(501).json({msg:'not implemented'})));

// product images
router.post('/products/:id/images', upload.single('file'), productController.addProductImage);
router.delete('/products/:id/images', productController.deleteProductImage);

// Stats / dashboard
router.get('/stats', adminController.getStats);

// send test email
router.post('/send-test-email', adminController.sendTestEmail);

module.exports = router;
