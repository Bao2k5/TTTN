// scripts/seed_hoang_my_silver.js
// Seed 25 silver 925 products for HM Jewelry
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../BE/src/models/product.model');
const Collection = require('../BE/src/models/collection.model');

// 25 Silver 925 Products with Unsplash URLs
const silverProducts = [
  // Rings (5)
  {
    name: 'Nhẫn Bạc 925 - Thiên Hà',
    slug: 'nhan-bac-925-thien-ha',
    price: 650000,
    priceSale: 585000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 tinh tế với họa tiết thiên hà, phù hợp đeo hàng ngày',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 20,
  },
  {
    name: 'Nhẫn Bạc 925 - Trăng Sao',
    slug: 'nhan-bac-925-trang-sao',
    price: 750000,
    priceSale: 675000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 với thiết kế trăng sao, lãng mạn và thanh lịch',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 15,
  },
  {
    name: 'Nhẫn Bạc 925 - Hoa Tulip',
    slug: 'nhan-bac-925-hoa-tulip',
    price: 700000,
    priceSale: 630000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 với họa tiết hoa tulip tinh tế, phong cách hiện đại',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 18,
  },
  {
    name: 'Nhẫn Bạc 925 - Hình Học',
    slug: 'nhan-bac-925-hinh-hoc',
    price: 600000,
    priceSale: 540000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 với họa tiết hình học tối giản, sang trọng',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 22,
  },
  {
    name: 'Nhẫn Bạc 925 - Lá Phong',
    slug: 'nhan-bac-925-la-phong',
    price: 680000,
    priceSale: 612000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 với họa tiết lá phong tự nhiên, dịu dàng',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 16,
  },

  // Necklaces (5)
  {
    name: 'Dây Chuyền Bạc 925 - Giọt Nước',
    slug: 'day-chuyen-bac-925-giot-nuoc',
    price: 850000,
    priceSale: 765000,
    category: 'Dây chuyền',
    material: 'Bạc 925',
    description: 'Dây chuyền bạc 925 với mặt giọt nước, thanh lịch và nhẹ nhàng',
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop' }],
    stock: 25,
  },
  {
    name: 'Dây Chuyền Bạc 925 - Hình Trái Tim',
    slug: 'day-chuyen-bac-925-trai-tim',
    price: 900000,
    priceSale: 810000,
    category: 'Dây chuyền',
    material: 'Bạc 925',
    description: 'Dây chuyền bạc 925 với mặt trái tim, lãng mạn và xinh xắn',
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop' }],
    stock: 20,
  },
  {
    name: 'Dây Chuyền Bạc 925 - Hoa Cúc',
    slug: 'day-chuyen-bac-925-hoa-cuc',
    price: 780000,
    priceSale: 702000,
    category: 'Dây chuyền',
    material: 'Bạc 925',
    description: 'Dây chuyền bạc 925 với mặt hoa cúc, tươi sáng và trẻ trung',
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop' }],
    stock: 18,
  },
  {
    name: 'Dây Chuyền Bạc 925 - Tròn Tối Giản',
    slug: 'day-chuyen-bac-925-tron-toi-gian',
    price: 720000,
    priceSale: 648000,
    category: 'Dây chuyền',
    material: 'Bạc 925',
    description: 'Dây chuyền bạc 925 với mặt tròn tối giản, phong cách hiện đại',
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop' }],
    stock: 24,
  },
  {
    name: 'Dây Chuyền Bạc 925 - Hình Sao',
    slug: 'day-chuyen-bac-925-sao',
    price: 800000,
    priceSale: 720000,
    category: 'Dây chuyền',
    material: 'Bạc 925',
    description: 'Dây chuyền bạc 925 với mặt sao, rạng rỡ và cuốn hút',
    name: 'Bông Tai Bạc 925 - Ngọc Trai',
    slug: 'bong-tai-bac-925-ngoc-trai',
    price: 380000,
    priceSale: 342000,
    category: 'Bông tai',
    material: 'Bạc 925',
    description: 'Bông tai bạc 925 với ngọc trai, thanh lịch và quyến rũ',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 28,
  },
  {
    name: 'Bông Tai Bạc 925 - Hình Lá',
    slug: 'bong-tai-bac-925-la',
    price: 320000,
    priceSale: 288000,
    category: 'Bông tai',
    material: 'Bạc 925',
    description: 'Bông tai bạc 925 với hình lá tự nhiên, dịu dàng',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 24,
  },
  {
    name: 'Bông Tai Bạc 925 - Hình Sao Biển',
    slug: 'bong-tai-bac-925-sao-bien',
    price: 350000,
    priceSale: 315000,
    category: 'Bông tai',
    material: 'Bạc 925',
    description: 'Bông tai bạc 925 với hình sao biển, vui vẻ và tươi sáng',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 20,
  },
  {
    name: 'Bông Tai Bạc 925 - Tròn Nhỏ',
    slug: 'bong-tai-bac-925-tron-nho',
    price: 280000,
    priceSale: 252000,
    category: 'Bông tai',
    material: 'Bạc 925',
    description: 'Bông tai bạc 925 tròn nhỏ, đơn giản và dễ phối',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 32,
  },
  {
    name: 'Bông Tai Bạc 925 - Hoa Nhỏ',
    slug: 'bong-tai-bac-925-hoa-nho',
    price: 340000,
    priceSale: 306000,
    category: 'Bông tai',
    material: 'Bạc 925',
    description: 'Bông tai bạc 925 với hoa nhỏ tinh tế, nữ tính',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 23,
  },
];

async function main() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/thuongmaidientu';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Create collection
    let col = await Collection.findOne({ slug: 'hoang-my-silver' });
    if (!col) {
      col = await Collection.create({
        name: 'HM Silver 925',
        slug: 'hoang-my-silver',
        description: 'Bộ sưu tập bạc 925 tinh tế, nhẹ nhàng'
      });
      console.log('Created collection: HM Silver 925');
    }

    // Delete old products
    const deleted = await Product.deleteMany({});
    console.log(`Deleted ${deleted.deletedCount} old products`);

    // Create products
    const productsWithCollection = silverProducts.map(p => ({
      ...p,
      collection: col._id,
      ratingsAvg: 4.8,
      ratingsCount: Math.floor(Math.random() * 50) + 10
    }));

    const created = await Product.insertMany(productsWithCollection);
    console.log(`\n✅ Created ${created.length} silver 925 products for HM Jewelry`);

    // Print product list
    console.log('\n📦 Products created:');
    created.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - ${(p.price / 1000).toFixed(0)}k đ`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
