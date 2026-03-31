require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../BE/src/models/product.model');
const Collection = require('../BE/src/models/collection.model');

async function resetProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all products
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} products`);

    // Create new products with images
    const col = await Collection.findOne({ slug: 'default' }) || await Collection.create({ name: 'Default', slug: 'default' });

    const products = await Product.create([
      {
        name: 'Nhẫn Kim Cương Sang Trọng',
        slug: 'nhan-kim-cuong-sang-trong',
        price: 15000000,
        priceSale: 12000000,
        category: 'Nhẫn',
        material: 'Vàng 18K, Kim cương',
        description: 'Nhẫn kim cương cao cấp, thiết kế sang trọng, phù hợp làm quà tặng hoặc đeo hàng ngày',
        images: [{ url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500' }],
        stock: 10,
        collection: col._id
      },
      {
        name: 'Dây Chuyền Vàng Ý',
        slug: 'day-chuyen-vang-y',
        price: 8000000,
        priceSale: 7200000,
        category: 'Dây chuyền',
        material: 'Vàng 24K',
        description: 'Dây chuyền vàng Ý cao cấp, thiết kế tinh xảo, độ bền cao',
        images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500' }],
        stock: 15,
        collection: col._id
      },
      {
        name: 'Bông Tai Ngọc Trai',
        slug: 'bong-tai-ngoc-trai',
        price: 5000000,
        category: 'Bông tai',
        material: 'Bạc 925, Ngọc trai',
        description: 'Bông tai ngọc trai thanh lịch, phù hợp với mọi lứa tuổi',
        images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500' }],
        stock: 20,
        collection: col._id
      },
      {
        name: 'Lắc Tay Bạc Nữ',
        slug: 'lac-tay-bac-nu',
        price: 3000000,
        priceSale: 2500000,
        category: 'Lắc tay',
        material: 'Bạc 925',
        description: 'Lắc tay bạc thiết kế trẻ trung, hiện đại',
        images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500' }],
        stock: 25,
        collection: col._id
      }
    ]);

    console.log(`✅ Created ${products.length} products with images`);
    console.log('Products:', products.map(p => `${p.name} - ${p.images[0]?.url || 'no image'}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
