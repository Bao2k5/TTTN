// src/controllers/cart.controller.js
const Cart = require("../models/cart.model");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [{ product: productId, qty }] });
      return res.status(201).json(cart);
    }
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].qty += qty;
    } else {
      cart.items.push({ product: productId, qty });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { productId, qty } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) return res.status(404).json({ msg: 'Item not in cart' });
    if (qty <= 0) cart.items.splice(idx, 1); else cart.items[idx].qty = qty;
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user.id });
    res.json({ msg: 'Cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('[Cart] Removing item:', productId, 'for user:', req.user.id);
    
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ msg: 'Cart not found' });
    
    console.log('[Cart] Before remove - items count:', cart.items.length);

    // Filter out the item
    const originalLength = cart.items.length;
    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    console.log('[Cart] After remove - items count:', cart.items.length, '(removed:', originalLength - cart.items.length, ')');

    cart.updatedAt = Date.now();
    await cart.save();
    
    // Populate before sending response
    await cart.populate('items.product');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
