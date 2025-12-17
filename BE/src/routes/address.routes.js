// src/routes/address.routes.js
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Tất cả routes đều cần xác thực
router.use(verifyToken);

// GET /api/address - Lấy danh sách địa chỉ của user hiện tại
router.get('/', addressController.getAddresses);

// POST /api/address - Tạo địa chỉ mới
router.post('/', addressController.createAddress);

// PUT /api/address/:id - Cập nhật địa chỉ
router.put('/:id', addressController.updateAddress);

// PUT /api/address/:id/set-default - Đặt địa chỉ làm mặc định
router.put('/:id/set-default', addressController.setDefaultAddress);

// DELETE /api/address/:id - Xóa địa chỉ
router.delete('/:id', addressController.deleteAddress);

module.exports = router;
