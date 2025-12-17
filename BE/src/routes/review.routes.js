// src/routes/review.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/review.controller');
const { verifyToken } = require('../middleware/auth.middleware');

router.get('/top-reviews', reviewController.getTopReviews);
router.get('/', reviewController.listReviews);
router.post('/', verifyToken, reviewController.createReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;
