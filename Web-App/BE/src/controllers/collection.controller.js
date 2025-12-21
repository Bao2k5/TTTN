// src/controllers/collection.controller.js
const Collection = require('../models/collection.model');
const Product = require('../models/product.model');

exports.listCollections = async (req, res) => {
  try {
    const collections = await Collection.find();
    
    // Add product count for each collection
    const collectionsWithCount = await Promise.all(
      collections.map(async (col) => {
        const productCount = await Product.countDocuments({ category: col.name });
        return {
          ...col.toObject(),
          productCount
        };
      })
    );
    
    res.json({ collections: collectionsWithCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCollectionBySlug = async (req, res) => {
  try {
    const col = await Collection.findOne({ slug: req.params.slug });
    if (!col) return res.status(404).json({ msg: 'Not found' });
    // return products in collection with pagination
    let { page = 1, limit = 12 } = req.query; page = parseInt(page); limit = parseInt(limit);
    const filter = { collection: col._id };
    const products = await Product.find(filter).skip((page-1)*limit).limit(limit);
    const total = await Product.countDocuments(filter);
    res.json({ collection: col, products, total, page, pages: Math.ceil(total/limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCollection = async (req, res) => {
  try {
    const { name, slug, description, image, featured } = req.body;
    
    // Check if slug already exists
    const existing = await Collection.findOne({ slug });
    if (existing) {
      return res.status(400).json({ message: 'Slug đã tồn tại' });
    }
    
    const collection = new Collection({
      name,
      slug,
      description,
      image,
      featured: featured || false
    });
    
    await collection.save();
    res.status(201).json({ message: 'Tạo bộ sưu tập thành công', collection });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, featured } = req.body;
    
    // Check if slug already exists (excluding current collection)
    if (slug) {
      const existing = await Collection.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        return res.status(400).json({ message: 'Slug đã tồn tại' });
      }
    }
    
    const collection = await Collection.findByIdAndUpdate(
      id,
      { name, slug, description, image, featured },
      { new: true, runValidators: true }
    );
    
    if (!collection) {
      return res.status(404).json({ message: 'Không tìm thấy bộ sưu tập' });
    }
    
    res.json({ message: 'Cập nhật bộ sưu tập thành công', collection });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await Collection.findByIdAndDelete(id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Không tìm thấy bộ sưu tập' });
    }
    
    res.json({ message: 'Xóa bộ sưu tập thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
