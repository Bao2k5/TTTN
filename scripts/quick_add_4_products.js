// Quick add 4 sample products for easy image upload later
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../BE/src/models/product.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hoangmyjewelry';

const quickProducts = [
  {
    name: 'Nhẫn Bạc 925 Cao Cấp',
    slug: 'nhan-bac-925-cao-cap',
    price: 1500000,
    priceSale: 1200000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 thiết kế tinh tế, sang trọng, phù hợp cho mọi dịp',
    stock: 15,
    images: [], // Sẽ thêm ảnh sau
    specifications: {
      material: 'Bạc 925',
      gemstone: 'CZ',
      weight: '3.2g',
      size: '5-7'
    }
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
    images: [],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'Không',
      weight: '5.5g',
      size: '40-45cm'
    }
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
    images: [],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'CZ',
      weight: '2.8g',
      size: 'One size'
    }
  },
  {
    name: 'Vòng Tay Bạc 925 Charm',
    slug: 'vong-tay-bac-925-charm',
    price: 2200000,
    priceSale: 1800000,
    category: 'Vòng Tay',
    material: 'Bạc 925',
    description: 'Vòng tay bạc 925 kiểu charm, có thể tùy chỉnh thêm charm theo sở thích',
    stock: 18,
    images: [],
    specifications: {
      material: 'Bạc 925',
      gemstone: 'Không',
      weight: '8.5g',
      size: '17-19cm'
    }
  }
];

const addProducts = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const productData of quickProducts) {
      const product = await Product.create(productData);
      console.log(`✅ Created: ${product.name} (ID: ${product._id})`);
    }

    console.log('\n🎉 Done! 4 sản phẩm đã được tạo!');
    console.log('📝 Bây giờ vào /admin/products, click "Sửa" và upload ảnh nhé!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addProducts();
