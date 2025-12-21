// src/routes/promo.routes.js
const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promo.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

router.get('/active', promoController.listActivePromos);
router.post('/', verifyToken, isAdmin, promoController.createPromo);
router.put('/:id', verifyToken, isAdmin, promoController.updatePromo);
router.delete('/:id', verifyToken, isAdmin, promoController.deletePromo);

module.exports = router;
