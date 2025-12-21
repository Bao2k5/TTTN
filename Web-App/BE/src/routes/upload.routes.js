// src/routes/upload.routes.js
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');
const { uploadLimiter } = require('../middleware/security.middleware');

router.post('/image', uploadLimiter, verifyToken, isAdmin, uploadController.upload, uploadController.uploadImage);
router.delete('/image', verifyToken, isAdmin, uploadController.deleteImage);

module.exports = router;