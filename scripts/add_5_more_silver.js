// Add 5 more silver products (total 25)
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../BE/src/models/product.model');
const Collection = require('../BE/src/models/collection.model');

const more5Products = [
  {
    name: 'Nhẫn Bạc 925 - Xinh Xinh',
    slug: 'nhan-bac-925-xinh-xinh',
    price: 620000,
    priceSale: 558000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 với họa tiết xinh xinh, dễ thương',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 19,
  },
  {
    name: 'Dây Chuyền Bạc 925 - Hình Tròn Lồi',
    slug: 'day-chuyen-bac-925-tron-loi',
    price: 880000,
    priceSale: 792000,
    category: 'Dây chuyền',
    material: 'Bạc 925',
    description: 'Dây chuyền bạc 925 với mặt tròn lồi, sang trọng',
    images: [{ url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop' }],
    stock: 14,
  },
  {
    name: 'Vòng Tay Bạc 925 - Hạt Lòng Chai',
    slug: 'vong-tay-bac-925-long-chai',
    price: 590000,
    priceSale: 531000,
    category: 'Vòng tay',
    material: 'Bạc 925',
    description: 'Vòng tay bạc 925 với hạt lòng chai, tự nhiên',
    images: [{ url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop' }],
    stock: 20,
  },
  {
    name: 'Bông Tai Bạc 925 - Hình Mặt Trời',
    slug: 'bong-tai-bac-925-mat-troi',
    price: 360000,
    priceSale: 324000,
    category: 'Bông tai',
    material: 'Bạc 925',
    description: 'Bông tai bạc 925 với hình mặt trời, rạng rỡ',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 26,
  },
  {
    name: 'Nhẫn Bạc 925 - Kết Cửu',
    slug: 'nhan-bac-925-ket-cuu',
    price: 710000,
    priceSale: 639000,
    category: 'Nhẫn',
    material: 'Bạc 925',
    description: 'Nhẫn bạc 925 với họa tiết kết cửu, hưng lợi',
    images: [{ url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop' }],
    stock: 17,
  },
];

async function main() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/thuongmaidientu';
    await mongoose.connect(uri);
    
    const col = await Collection.findOne({ slug: 'hoang-my-silver' });
    const productsWithCollection = more5Products.map(p => ({
      ...p,
      collection: col._id,
      ratingsAvg: 4.8,
      ratingsCount: Math.floor(Math.random() * 50) + 10
    }));
    
    const created = await Product.insertMany(productsWithCollection);
    console.log('\n✅ Added 5 more silver 925 products (total 25)');
    created.forEach((p, i) => {
      console.log(`${i + 21}. ${p.name} - ${(p.price / 1000).toFixed(0)}k đ`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

main();
