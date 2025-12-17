// Seed products with working image URLs
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../BE/src/models/product.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hoangmyjewelry';

// Products with working Unsplash images
const products = [
  {
    name: 'Nhẫn bạc - Hoa Thiên Lý',
    slug: 'nhan-bac-hoa-thien-ly',
    price: 300000,
    priceSale: null,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 thiết kế hoa tinh tế, thanh lịch',
    stock: 20,
    images: [
      { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop', public_id: 'unsplash_1' },
      { url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop', public_id: 'unsplash_2' }
    ],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'Không',
      weight: '2.5g',
      size: '5-7'
    },
    rating: 5,
    reviews: 0
  },
  {
    name: 'Nhẫn bạc - Hoa tím lươm',
    slug: 'nhan-bac-hoa-tim-luom',
    price: 450000,
    priceSale: null,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 đính đá tím, sang trọng quý phái',
    stock: 15,
    images: [
      { url: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&h=500&fit=crop', public_id: 'unsplash_3' },
      { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop', public_id: 'unsplash_4' }
    ],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'Đá tím nhân tạo',
      weight: '3.2g',
      size: '5-7'
    },
    rating: 5,
    reviews: 0
  },
  {
    name: 'Nhẫn bạc - Hoa băng lăng',
    slug: 'nhan-bac-hoa-bang-lang',
    price: 340000,
    priceSale: null,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 hoa băng lăng tinh xảo',
    stock: 18,
    images: [
      { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop', public_id: 'unsplash_5' },
      { url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop', public_id: 'unsplash_6' }
    ],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'Không',
      weight: '2.8g',
      size: '6-8'
    },
    rating: 5,
    reviews: 0
  },
  {
    name: 'Dây Chuyền Bạc 925 Thanh Lịch',
    slug: 'day-chuyen-bac-925-thanh-lich',
    price: 2500000,
    priceSale: 2000000,
    category: 'Dây Chuyền',
    material: 'Bạc 925',
    description: 'Dây chuyền bạc 925 kiểu dáng hiện đại, tôn lên vẻ đẹp quý phái',
    stock: 20,
    images: [
      { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop', public_id: 'unsplash_7' },
      { url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop', public_id: 'unsplash_8' }
    ],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'Không',
      weight: '5.5g',
      size: '40-45cm'
    },
    rating: 5,
    reviews: 0
  },
  {
    name: 'Bông Tai Bạc 925 Đính Đá',
    slug: 'bong-tai-bac-925-dinh-da',
    price: 1800000,
    priceSale: 1500000,
    category: 'Bông Tai',
    material: 'Bạc 925',
    description: 'Bông tai bạc 925 đính đá CZ lấp lánh, thiết kế nữ tính',
    stock: 25,
    images: [
      { url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop', public_id: 'unsplash_9' },
      { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop', public_id: 'unsplash_10' }
    ],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'CZ',
      weight: '2.8g',
      material: 'Bạc 925',
      gemstone: 'Không',
      weight: '8.5g',
      size: '17-19cm'
    },
    rating: 5,
    reviews: 0
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    const created = await Product.insertMany(products);
    console.log(`✅ Created ${created.length} products with working images!`);

    console.log('\n📦 Products added:');
    created.forEach(p => {
      console.log(`   - ${p.name} (${p.category})`);
      console.log(`     Images: ${p.images.length} URLs`);
    });

    console.log('\n🎉 Done! Refresh your website to see products with images!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedProducts();
