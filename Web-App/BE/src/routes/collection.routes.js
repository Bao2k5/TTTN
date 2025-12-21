// src/routes/collection.routes.js
const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collection.controller');
const productController = require('../controllers/product.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/', collectionController.listCollections);
router.get('/:slug', collectionController.getCollectionBySlug);
router.get('/:slug/products', productController.getByCollectionSlug);

// Admin routes
router.post('/', verifyToken, isAdmin, collectionController.createCollection);
router.put('/:id', verifyToken, isAdmin, collectionController.updateCollection);
router.delete('/:id', verifyToken, isAdmin, collectionController.deleteCollection);

module.exports = router;
