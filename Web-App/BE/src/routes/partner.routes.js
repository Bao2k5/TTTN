const express = require('express');
const {
  getPartners,
  getAllPartners,
  createPartner,
  updatePartner,
  deletePartner,
  bulkUpdatePosition,
} = require('../controllers/partner.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', getPartners);

// Admin routes
router.get('/admin/all', verifyToken, isAdmin, getAllPartners);
router.post('/admin/create', verifyToken, isAdmin, createPartner);
router.put('/admin/update/:id', verifyToken, isAdmin, updatePartner);
router.delete('/admin/delete/:id', verifyToken, isAdmin, deletePartner);
router.put('/admin/bulk-position', verifyToken, isAdmin, bulkUpdatePosition);

module.exports = router;
