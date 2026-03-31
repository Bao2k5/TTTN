// src/controllers/promo.controller.js
const Promo = require('../models/promo.model');
const Product = require('../models/product.model');

exports.listActivePromos = async (req, res) => {
  try {
    const now = new Date();
    const promos = await Promo.find({ active: true, startAt: { $lte: now }, endAt: { $gte: now } });
    res.json(promos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPromo = async (req, res) => {
  try {
    const promo = await Promo.create(req.body);
    // if promo targets a product and is active, apply priceSale
    if (promo.type === 'product' && promo.product && promo.isActive && promo.discountPercent) {
      const p = await Product.findById(promo.product);
      if (p) {
        p.priceSale = Math.round(p.price * (1 - promo.discountPercent/100));
        p.isFlashSale = true;
        await p.save();
      }
    }
    res.status(201).json(promo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const p = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // apply/remove as needed
    if (p.type === 'product' && p.product && p.discountPercent) {
      const prod = await Product.findById(p.product);
      if (prod && p.isActive) {
        prod.priceSale = Math.round(prod.price * (1 - p.discountPercent/100));
        prod.isFlashSale = true;
        await prod.save();
      } else if (prod && !p.isActive) {
        prod.priceSale = undefined;
        prod.isFlashSale = false;
        await prod.save();
      }
    }
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (promo && promo.type === 'product' && promo.product) {
      const prod = await Product.findById(promo.product);
      if (prod) {
        prod.priceSale = undefined;
        prod.isFlashSale = false;
        await prod.save();
      }
    }
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
