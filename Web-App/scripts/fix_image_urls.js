require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../BE/src/config/db');
const Collection = require('../BE/src/models/collection.model');
const Product = require('../BE/src/models/product.model');

/**
 * Fix all image URLs to use full backend URL
 */
const fixImageUrls = async () => {
  try {
    console.log('[CONNECT] Connecting to MongoDB...');
    await connectDB();

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    console.log(`[NOTE] Backend URL: ${backendUrl}`);

    // Fix Collections
    console.log('\n[PACKAGE] Fixing collection image URLs...');
    const collections = await Collection.find();
    let collectionCount = 0;

    for (const collection of collections) {
      if (collection.image && collection.image.startsWith('/uploads/')) {
        const oldUrl = collection.image;
        collection.image = `${backendUrl}${oldUrl}`;
        await collection.save();
        console.log(`    ${collection.name}: ${oldUrl} → ${collection.image}`);
        collectionCount++;
      } else if (collection.image && !collection.image.startsWith('http')) {
        console.log(`   [WARNING]  ${collection.name}: ${collection.image} (not fixed)`);
      } else {
        console.log(`    ${collection.name}: ${collection.image || 'No image'} (already OK)`);
      }
    }

    // Fix Products
    console.log('\n[PRODUCT] Fixing product image URLs...');
    const products = await Product.find();
    let productCount = 0;

    for (const product of products) {
      let updated = false;

      if (product.images && Array.isArray(product.images)) {
        product.images = product.images.map(img => {
          if (typeof img === 'string' && img.startsWith('/uploads/')) {
            updated = true;
            return `${backendUrl}${img}`;
          } else if (img && img.url && img.url.startsWith('/uploads/')) {
            updated = true;
            img.url = `${backendUrl}${img.url}`;
            return img;
          }
          return img;
        });

        if (updated) {
          await product.save();
          console.log(`    ${product.name}`);
          productCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('[SUCCESS] Image URL fix completed!');
    console.log(`   Collections updated: ${collectionCount}`);
    console.log(`   Products updated: ${productCount}`);
    console.log('\n[TIP] All image URLs now use full backend URL');
    console.log(`   Example: ${backendUrl}/uploads/filename.png`);

    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error:', error);
    process.exit(1);
  }
};

fixImageUrls();
