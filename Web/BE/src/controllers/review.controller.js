// src/controllers/review.controller.js
const Review = require('../models/review.model');
const Product = require('../models/product.model');

async function updateProductRatings(productId) {
  const agg = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (agg.length > 0) {
    await Product.findByIdAndUpdate(productId, { ratingsAvg: agg[0].avg, ratingsCount: agg[0].count });
  } else {
    await Product.findByIdAndUpdate(productId, { ratingsAvg: 0, ratingsCount: 0 });
  }
}

exports.getTopReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ rating: 5 })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name')
      .populate('product', 'name images');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, text } = req.body;
    const userId = req.user.id;
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) return res.status(400).json({ msg: 'You already reviewed this product' });
    const review = await Review.create({ product: productId, user: userId, rating, title, text });
    await updateProductRatings(productId);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const rev = await Review.findById(id);
    if (!rev) return res.status(404).json({ msg: 'Not found' });
    if (rev.user.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ msg: 'Forbidden' });
    await Review.findByIdAndDelete(id);
    await updateProductRatings(rev.product);
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
