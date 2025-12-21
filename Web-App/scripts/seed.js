// scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../BE/src/models/user.model');
const Product = require('../BE/src/models/product.model');
const Collection = require('../BE/src/models/collection.model');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');

  // create admin
  const adminEmail = 'admin@example.com';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('admin123', salt);
    admin = await User.create({ name: 'Admin', email: adminEmail, password: hashed, role: 'admin', emailVerified: true });
    console.log('Created admin', adminEmail);
  }

  // sample collection + products
  const col = await Collection.findOne({ slug: 'default' }) || await Collection.create({ name: 'Default', slug: 'default' });
  const pcount = await Product.countDocuments();
  if (pcount === 0) {
    await Product.create([
      {
        name: 'Nhẫn Kim Cương Sang Trọng',
        slug: 'nhan-kim-cuong-sang-trong',
        price: 15000000,
        priceSale: 12000000,
        category: 'Nhẫn',
        description: 'Nhẫn kim cương cao cấp, thiết kế sang trọng',
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
        description: 'Dây chuyền vàng Ý cao cấp, thiết kế tinh xảo',
        images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500' }],
        stock: 15,
        collection: col._id
      },
      {
        name: 'Bông Tai Ngọc Trai',
        slug: 'bong-tai-ngoc-trai',
        price: 5000000,
        category: 'Bông tai',
        description: 'Bông tai ngọc trai thanh lịch',
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
        description: 'Lắc tay bạc thiết kế trẻ trung, hiện đại',
        images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500' }],
        stock: 25,
        collection: col._id
      }
    ]);
    console.log('Created sample products with images');
  }

  console.log('Done');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });