// Restore deleted products without affecting existing ones
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../BE/src/models/product.model');
const Collection = require('../BE/src/models/collection.model');

const allProducts = [
  {
    name: 'Nhẫn Bạc 925 - Thiên Hà',
    slug: 'nhan-bac-925-thien-ha',
    description: 'Nhẫn bạc 925 tinh tế với họa tiết thiên hà, phù hợp đeo hàng ngày',
    price: 650000,
    priceSale: 585000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 20,
    category: 'Nhẫn',
    material: 'Bạc 925'
  },
  {
    name: 'Nhẫn Bạc 925 - Trăng Sao',
    slug: 'nhan-bac-925-trang-sao',
    description: 'Nhẫn bạc 925 với thiết kế trăng sao, lãng mạn và thanh lịch',
    price: 750000,
    priceSale: 675000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 15,
    category: 'Nhẫn',
    material: 'Bạc 925'
  },
  {
    name: 'Nhẫn Bạc 925 - Hoa Tulip',
    slug: 'nhan-bac-925-hoa-tulip',
    description: 'Nhẫn bạc 925 với họa tiết hoa tulip tinh tế, phong cách hiện đại',
    price: 700000,
    priceSale: 630000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 18,
    category: 'Nhẫn',
    material: 'Bạc 925'
  },
  {
    name: 'Nhẫn Bạc 925 - Hình Học',
    slug: 'nhan-bac-925-hinh-hoc',
    description: 'Nhẫn bạc 925 với họa tiết hình học tối giản, sang trọng',
    price: 600000,
    priceSale: 540000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 22,
    category: 'Nhẫn',
    material: 'Bạc 925'
  },
  {
    name: 'Nhẫn Bạc 925 - Lá Phong',
    slug: 'nhan-bac-925-la-phong',
    description: 'Nhẫn bạc 925 với họa tiết lá phong tự nhiên, dịu dàng',
    price: 680000,
    priceSale: 612000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 16,
    category: 'Nhẫn',
    material: 'Bạc 925'
  },
  {
    name: 'Dây Chuyền Bạc 925 - Giọt Nước',
    slug: 'day-chuyen-bac-925-giot-nuoc',
    description: 'Dây chuyền bạc 925 mặt giọt nước, thanh thoát và tinh tế',
    price: 850000,
    priceSale: 765000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 12,
    category: 'Dây Chuyền',
    material: 'Bạc 925'
  },
  {
    name: 'Dây Chuyền Bạc 925 - Hình Trái Tim',
    slug: 'day-chuyen-bac-925-hinh-trai-tim',
    description: 'Dây chuyền bạc 925 mặt trái tim, biểu tượng tình yêu',
    price: 900000,
    priceSale: 810000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 10,
    category: 'Dây Chuyền',
    material: 'Bạc 925'
  },
  {
    name: 'Dây Chuyền Bạc 925 - Hoa Cúc',
    slug: 'day-chuyen-bac-925-hoa-cuc',
    description: 'Dây chuyền bạc 925 mặt hoa cúc, tươi mới và nhẹ nhàng',
    price: 780000,
    priceSale: 702000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 14,
    category: 'Dây Chuyền',
    material: 'Bạc 925'
  },
  {
    name: 'Dây Chuyền Bạc 925 - Tròn Tối Giản',
    slug: 'day-chuyen-bac-925-tron-toi-gian',
    description: 'Dây chuyền bạc 925 mặt tròn tối giản, phong cách hiện đại',
    price: 720000,
    priceSale: 648000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 16,
    category: 'Dây Chuyền',
    material: 'Bạc 925'
  },
  {
    name: 'Dây Chuyền Bạc 925 - Hình Sao',
    slug: 'day-chuyen-bac-925-hinh-sao',
    description: 'Dây chuyền bạc 925 mặt ngôi sao, tỏa sáng và nổi bật',
    price: 800000,
    priceSale: 720000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 13,
    category: 'Dây Chuyền',
    material: 'Bạc 925'
  },
  {
    name: 'Vòng Tay Bạc 925 - Hạt Tròn',
    slug: 'vong-tay-bac-925-hat-tron',
    description: 'Vòng tay bạc 925 hạt tròn, đơn giản và thanh lịch',
    price: 520000,
    priceSale: 468000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 25,
    category: 'Vòng Tay',
    material: 'Bạc 925'
  },
  {
    name: 'Vòng Tay Bạc 925 - Hạt Lập Phương',
    slug: 'vong-tay-bac-925-hat-lap-phuong',
    description: 'Vòng tay bạc 925 hạt lập phương, cá tính và hiện đại',
    price: 580000,
    priceSale: 522000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 20,
    category: 'Vòng Tay',
    material: 'Bạc 925'
  },
  {
    name: 'Vòng Tay Bạc 925 - Hạt Oval',
    slug: 'vong-tay-bac-925-hat-oval',
    description: 'Vòng tay bạc 925 hạt oval, mềm mại và duyên dáng',
    price: 550000,
    priceSale: 495000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 22,
    category: 'Vòng Tay',
    material: 'Bạc 925'
  },
  {
    name: 'Vòng Tay Bạc 925 - Xỏ Tay',
    slug: 'vong-tay-bac-925-xo-tay',
    description: 'Vòng tay bạc 925 kiểu xỏ tay, sang trọng và quý phái',
    price: 620000,
    priceSale: 558000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 18,
    category: 'Vòng Tay',
    material: 'Bạc 925'
  },
  {
    name: 'Vòng Tay Bạc 925 - Vô Cực',
    slug: 'vong-tay-bac-925-vo-cuc',
    description: 'Vòng tay bạc 925 biểu tượng vô cực, ý nghĩa và đẹp mắt',
    price: 540000,
    priceSale: 486000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 24,
    category: 'Vòng Tay',
    material: 'Bạc 925'
  },
  {
    name: 'Bông Tai Bạc 925 - Ngọc Trai',
    slug: 'bong-tai-bac-925-ngoc-trai',
    description: 'Bông tai bạc 925 đính ngọc trai, quý phái và thanh lịch',
    price: 380000,
    priceSale: 342000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 30,
    category: 'Bông Tai',
    material: 'Bạc 925'
  },
  {
    name: 'Bông Tai Bạc 925 - Hình Lá',
    slug: 'bong-tai-bac-925-hinh-la',
    description: 'Bông tai bạc 925 hình lá, tự nhiên và tươi mới',
    price: 320000,
    priceSale: 288000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 35,
    category: 'Bông Tai',
    material: 'Bạc 925'
  },
  {
    name: 'Bông Tai Bạc 925 - Hình Sao Biển',
    slug: 'bong-tai-bac-925-hinh-sao-bien',
    description: 'Bông tai bạc 925 hình sao biển, ngọt ngào và dễ thương',
    price: 350000,
    priceSale: 315000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 28,
    category: 'Bông Tai',
    material: 'Bạc 925'
  },
  {
    name: 'Bông Tai Bạc 925 - Tròn Nhỏ',
    slug: 'bong-tai-bac-925-tron-nho',
    description: 'Bông tai bạc 925 tròn nhỏ, tối giản và hiện đại',
    price: 280000,
    priceSale: 252000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 40,
    category: 'Bông Tai',
    material: 'Bạc 925'
  },
  {
    name: 'Bông Tai Bạc 925 - Hoa Nhỏ',
    slug: 'bong-tai-bac-925-hoa-nho',
    description: 'Bông tai bạc 925 hình hoa nhỏ, xinh xắn và nữ tính',
    price: 340000,
    priceSale: 306000,
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 32,
    category: 'Bông Tai',
    material: 'Bạc 925'
  }
];

async function restoreProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hoangmy');
    console.log('Connected to MongoDB');

    // Get collection
    let col = await Collection.findOne({ slug: 'hm-silver' });
    if (!col) {
      col = await Collection.create({
        name: 'HM Silver 925',
        slug: 'hm-silver',
        description: 'Bộ sưu tập bạc 925 tinh tế, nhẹ nhàng'
      });
      console.log('Created collection: HM Silver 925');
    }

    // Check which products are missing
    const existingSlugs = (await Product.find({}, 'slug')).map(p => p.slug);
    const missingProducts = allProducts.filter(p => !existingSlugs.includes(p.slug));

    if (missingProducts.length === 0) {
      console.log('✅ Tất cả 20 sản phẩm đã có đủ!');
      process.exit(0);
    }

    console.log(`\n📥 Phục hồi ${missingProducts.length} sản phẩm bị xóa...`);

    // Add collection ID and ratings
    const productsToRestore = missingProducts.map(p => ({
      ...p,
      collection: col._id,
      ratingsAvg: 4.8,
      ratingsCount: Math.floor(Math.random() * 50) + 10
    }));

    const restored = await Product.insertMany(productsToRestore);
    
    console.log(`\n✅ Đã phục hồi ${restored.length} sản phẩm:`);
    restored.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - ${(p.price / 1000).toFixed(0)}k đ`);
    });

    const totalNow = await Product.countDocuments();
    console.log(`\n📊 Tổng số sản phẩm hiện tại: ${totalNow}/20`);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

restoreProducts();
