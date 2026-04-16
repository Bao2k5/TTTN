// src/models/product.model.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
{
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  priceSale: { type: Number },
  
  sku: { type: String, index: true },
  images: [{ url: String, public_id: String }],
  stock: { type: Number, default: 0 },
  category: { type: String, index: true },
  collection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" },
  tags: [{ type: String, index: true }],
  isFlashSale: { type: Boolean, default: false },
  ratingsAvg: { type: Number, default: 0 },
  ratingsCount: { type: Number, default: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  attributes: { type: Object },
  createdAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model("Product", productSchema);
