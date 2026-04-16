// src/controllers/product.controller.js
const Product = require("../models/product.model");
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const { slugify } = require('../utils/helpers');

// Lấy danh sách sản phẩm (có phân trang + lọc)
exports.listProducts = async (req, res) => {
  try {
    let { page = 1, limit = 12, q, collection, category, tag, minPrice, maxPrice, flash } = req.query;
    page = parseInt(page); limit = parseInt(limit);
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (collection) filter.collection = collection;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    if (flash === '1' || flash === 'true') filter.isFlashSale = true;

    let products = await Product.find(filter).populate('collection').skip((page - 1) * limit).limit(limit);
    const total = await Product.countDocuments(filter);

    // Logic khuyến mãi đơn giản: nếu là flash sale thì dùng giá sale
    // TODO: Cần làm thêm logic check ngày hết hạn khuyến mãi sau này
    products = products.map(p => {
      const obj = p.toObject();
      if (obj.priceSale) obj.displayPrice = obj.priceSale; else obj.displayPrice = obj.price;
      return obj;
    });

    res.json({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id).populate('collection');
    if (!p) return res.status(404).json({ msg: "Not found" });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const p = await Product.findOne({ slug: req.params.slug }).populate('collection');
    if (!p) return res.status(404).json({ msg: 'Not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log('[CREATE PRODUCT] Request body:', JSON.stringify(req.body, null, 2));
    const body = req.body;
    // Tự động tạo slug nếu không có (để URL đẹp hơn)
    if (!body.slug && body.name) {
      body.slug = slugify(body.name);
      console.log(`Generated slug: "${body.slug}"`);
    }
    console.log('Creating product with data:', JSON.stringify(body, null, 2));
    const newP = await Product.create(body);
    console.log('[OK] Product created successfully:', newP._id);
    res.status(201).json(newP);
  } catch (err) {
    console.error('[CREATE PRODUCT ERROR]:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.code) console.error('Error code:', err.code);
    if (err.keyPattern) console.error('Duplicate key:', err.keyPattern);
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload ảnh sản phẩm (dùng multer để xử lý file)
exports.addProductImage = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ msg: 'file required' });
    const result = await uploadImage(req.file.buffer, 'products');
    const product = await Product.findById(req.params.id);
    product.images = product.images || [];
    product.images.push({ url: result.secure_url, public_id: result.public_id });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProductImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ msg: 'publicId required' });
    await deleteImage(publicId);
    const product = await Product.findById(req.params.id);
    if (product && product.images) {
      product.images = product.images.filter(i => i.public_id !== publicId);
      await product.save();
    }
    res.json({ msg: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy 8 sản phẩm mới nhất
exports.getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('_id name slug price priceSale images thumbnail');
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy sản phẩm theo bộ sưu tập (slug)
exports.getByCollectionSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const { limit, material, color, shape, ready, sort } = req.query;

    // Tìm collection trước
    const Collection = require('../models/collection.model');
    const collection = await Collection.findOne({ slug });
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Build bộ lọc
    const queryFilters = { collection: collection._id };

    if (material) queryFilters.material = material;
    if (color) queryFilters.color = color;
    if (shape) queryFilters.shape = shape;
    if (ready === 'true') queryFilters.inStock = true;

    // Query database
    let query = Product.find(queryFilters)
      .select('_id name slug price priceSale images thumbnail category material color shape inStock');

    // Sắp xếp theo giá hoặc mới nhất
    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else {
      // Default: newest first
      query = query.sort({ createdAt: -1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query;
    res.json({ products, collection });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tìm kiếm sản phẩm theo từ khóa
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    if (!q || q.trim().length === 0) {
      return res.json({ products: [] });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    // Tìm trong tên, mô tả và tags
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ]
    })
      .select('_id name slug price priceSale images thumbnail category')
      .limit(limit);

    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
