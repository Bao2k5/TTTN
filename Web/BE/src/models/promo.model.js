// src/models/promo.model.js
const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema(
{
  title: { type: String, required: true },
  type: { type: String, enum: ['product', 'collection', 'sitewide'], default: 'product' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  collection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  discountPercent: { type: Number },
  discountAmount: { type: Number },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

promoSchema.methods.isActive = function() {
  const now = Date.now();
  return this.active && now >= this.startAt.getTime() && now <= this.endAt.getTime();
}

module.exports = mongoose.model('Promo', promoSchema);
