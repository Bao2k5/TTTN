// Remove the 4 products just created
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../BE/src/models/product.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hoangmyjewelry';

const removeTestProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete the 4 products by slug
    const slugs = [
      'nhan-bac-925-cao-cap',
      'day-chuyen-bac-925-thanh-lich',
      'bong-tai-bac-925-dinh-da',
      'vong-tay-bac-925-charm'
    ];

    const result = await Product.deleteMany({ slug: { $in: slugs } });
    console.log(`🗑️  Đã xóa ${result.deletedCount} sản phẩm`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

removeTestProducts();
