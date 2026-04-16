// src/models/collection.model.js
const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema(
{
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { suppressReservedKeysWarning: true });

module.exports = mongoose.model('Collection', collectionSchema);
