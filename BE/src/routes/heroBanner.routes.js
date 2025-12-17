const express = require('express');
const router = express.Router();
const {
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} = require('../controllers/heroBanner.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

// Public routes
router.get('/active', getActiveBanners);

// Admin routes
router.get('/admin', verifyToken, isAdmin, getAllBanners);
router.get('/:id', verifyToken, isAdmin, getBannerById);
router.post('/', verifyToken, isAdmin, createBanner);
router.put('/:id', verifyToken, isAdmin, updateBanner);
router.patch('/:id/toggle', verifyToken, isAdmin, toggleBannerStatus);
router.delete('/:id', verifyToken, isAdmin, deleteBanner);

module.exports = router;
