// src/controllers/wishlist.controller.js
const User = require('../models/user.model');

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    // Return wishlist in expected format for frontend
    const wishlist = (user.wishlist || []).map(product => ({
      product: product
    }));
    res.json({ wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { productId } = req.body; // Changed from req.params to req.body
    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (!productId) return res.status(400).json({ msg: 'productId is required' });
    if (!user.wishlist) user.wishlist = [];
    if (user.wishlist.find(id => id.toString() === productId)) return res.status(400).json({ msg: 'Already in wishlist' });
    user.wishlist.push(productId);
    await user.save();
    res.status(201).json({ message: 'Added to wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { productId } = req.params;
    if (!user) return res.status(404).json({ msg: 'User not found' });
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
