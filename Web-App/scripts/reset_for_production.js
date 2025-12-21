require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../BE/src/config/db');
const Collection = require('../BE/src/models/collection.model');
const Product = require('../BE/src/models/product.model');
const User = require('../BE/src/models/user.model');
const Order = require('../BE/src/models/order.model');
const Cart = require('../BE/src/models/cart.model');
const Review = require('../BE/src/models/review.model');
const AdminLog = require('../BE/src/models/adminLog.model');

/**
 * Script to prepare database for production
 * - Keeps admin user
 * - Keeps 4 collections
 * - Removes test/mock data
 * - Keeps real products (if any)
 */

const resetForProduction = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectDB();

    console.log('\n📊 Current Database State:');
    const counts = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      collections: await Collection.countDocuments(),
      orders: await Order.countDocuments(),
      carts: await Cart.countDocuments(),
      reviews: await Review.countDocuments(),
      adminLogs: await AdminLog.countDocuments()
    };
    
    Object.entries(counts).forEach(([key, count]) => {
      console.log(`   ${key}: ${count}`);
    });

    console.log('\n🗑️  Cleaning up test data...');
    
    // Remove test orders
    await Order.deleteMany({});
    console.log('   ✓ Removed all orders (will be created by real customers)');
    
    // Remove test carts
    await Cart.deleteMany({});
    console.log('   ✓ Removed all carts (will be created by real customers)');
    
    // Remove test reviews
    await Review.deleteMany({});
    console.log('   ✓ Removed all reviews (will be created by real customers)');
    
    // Remove test admin logs
    await AdminLog.deleteMany({});
    console.log('   ✓ Removed all admin logs');
    
    // Keep admin user, remove test users
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (adminUser) {
      await User.deleteMany({ _id: { $ne: adminUser._id } });
      console.log('   ✓ Kept admin user, removed test users');
    } else {
      console.log('   ⚠️  No admin user found');
    }
    
    // Check collections
    const collections = await Collection.find();
    console.log('\n📦 Collections (kept):');
    collections.forEach(col => {
      console.log(`   - ${col.name} (${col.slug})`);
    });
    
    // Check products
    const products = await Product.find();
    console.log('\n🏆 Products (kept):');
    if (products.length === 0) {
      console.log('   ⚠️  No products found. You need to add products via admin panel.');
    } else {
      products.forEach(product => {
        console.log(`   - ${product.name} (${product.category}) - ${product.price.toLocaleString()}đ`);
      });
    }

    console.log('\n✅ Database cleaned for production!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Login to admin panel: http://localhost:3001/admin');
    console.log('   2. Add real products with beautiful images');
    console.log('   3. Update collection images if needed');
    console.log('   4. Test the website thoroughly');
    console.log('   5. Deploy to production server');
    
    console.log('\n💾 Data to keep:');
    console.log(`   - Admin user: ${adminUser ? adminUser.email : 'Not found'}`);
    console.log(`   - Collections: ${collections.length}`);
    console.log(`   - Products: ${products.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetForProduction();
