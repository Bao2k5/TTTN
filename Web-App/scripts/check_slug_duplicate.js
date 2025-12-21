// Check for slug duplicates
const mongoose = require('mongoose');
const Product = require('../BE/src/models/product.model');
require('dotenv').config();

async function checkSlugs() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoangmy');
    console.log('✅ Connected to MongoDB');
    
    const products = await Product.find({}, 'name slug').sort({ createdAt: -1 }).limit(10);
    console.log('\n📦 Last 10 products:');
    products.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} → slug: "${p.slug}"`);
    });
    
    const totalCount = await Product.countDocuments();
    console.log(`\n📊 Total products in DB: ${totalCount}`);
    
    // Check for duplicate slugs
    const duplicates = await Product.aggregate([
      { $group: { _id: '$slug', count: { $sum: 1 }, names: { $push: '$name' } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE SLUGS FOUND:');
      duplicates.forEach(dup => {
        console.log(`  - "${dup._id}" appears ${dup.count} times:`, dup.names);
      });
    } else {
      console.log('\n✅ No duplicate slugs');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkSlugs();
