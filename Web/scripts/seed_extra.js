// scripts/seed_extra.js
// Idempotent seeding: creates 3 collections, 3 products, 3 users (with hashed passwords),
// 3 orders, 3 reviews, 3 promos. Skips existing records based on unique fields.
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Collection = require('../BE/src/models/collection.model');
const Product = require('../BE/src/models/product.model');
const User = require('../BE/src/models/user.model');
const Order = require('../BE/src/models/order.model');
const Review = require('../BE/src/models/review.model');
const Promo = require('../BE/src/models/promo.model');

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/thuongmaidientu';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', uri);

  // Collections
  const collectionsData = [
    { name: 'Default', slug: 'default', description: 'Bộ sưu tập mặc định' },
    { name: 'Cao cấp', slug: 'premium', description: 'Sản phẩm cao cấp' },
    { name: 'Giá tốt', slug: 'budget', description: 'Sản phẩm giá tốt' }
  ];
  const collections = [];
  for (const c of collectionsData) {
    let doc = await Collection.findOne({ slug: c.slug });
    if (!doc) doc = await Collection.create(c);
    collections.push(doc);
  }
  console.log('Collections ready:', collections.map(c=>c.slug).join(', '));

  // Products
  const productsData = [
    {
      name: 'Nhẫn Kim Cương Sang Trọng', slug: 'nhan-kim-cuong-sang-trong', price: 15000000, priceSale:12000000,
      category:'Nhẫn', description:'Nhẫn kim cương cao cấp', images:[{url:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500'}], stock:10, collection: collections[0]._id
    },
    {
      name: 'Dây Chuyền Vàng Ý', slug: 'day-chuyen-vang-y', price: 8000000, priceSale:7200000,
      category:'Dây chuyền', description:'Dây chuyền vàng Ý tinh xảo', images:[{url:'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'}], stock:15, collection: collections[1]._id
    },
    {
      name: 'Bông Tai Ngọc Trai', slug: 'bong-tai-ngoc-trai', price:5000000, category:'Bông tai', description:'Bông tai ngọc trai thanh lịch', images:[{url:'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500'}], stock:20, collection: collections[2]._id
    }
  ];
  const products = [];
  for (const p of productsData) {
    let doc = await Product.findOne({ slug: p.slug });
    if (!doc) doc = await Product.create(p);
    products.push(doc);
  }
  console.log('Products ready:', products.map(p=>p.slug).join(', '));

  // Users (with hashed password pass1234)
  const usersData = [
    { name: 'Nguyễn Văn An', email: 'nguyenvanan@example.com' },
    { name: 'Trần Thị Bình', email: 'tranthibinh@example.com' },
    { name: 'Lê Văn Cường', email: 'levancuong@example.com' }
  ];
  const users = [];
  const pwHash = await bcrypt.hash('pass1234', 10);
  for (const u of usersData) {
    let doc = await User.findOne({ email: u.email });
    if (!doc) doc = await User.create({ ...u, password: pwHash, emailVerified: true });
    users.push(doc);
  }
  console.log('Users ready:', users.map(u=>u.email).join(', '));

  // Orders: create simple orders for each user using available products
  const orders = [];
  for (let i=0;i<users.length;i++) {
    const user = users[i];
    // Skip if user already has an order
    const existing = await Order.findOne({ user: user._id });
    if (existing) { orders.push(existing); continue; }
    const item1 = products[i % products.length];
    const item2 = products[(i+1) % products.length];
    const items = [ { product: item1._id, qty: 1, price: item1.priceSale || item1.price }, { product: item2._id, qty: 2, price: item2.priceSale || item2.price } ];
    const total = items.reduce((s,it)=>s + it.qty*it.price,0);
    const order = await Order.create({ user: user._id, items, total, status: i===0?'paid':(i===1?'pending':'shipped'), address: `Địa chỉ mẫu ${i+1}`, payment: { method: i===1?'cod':'online', status: i===0?'paid':'pending', transactionId: i===0?`MOCK-${Date.now()}`:'' }, stockAdjusted: i!==1 });
    orders.push(order);
  }
  console.log('Orders created for users');

  // Reviews
  const reviewsData = [
    { product: products[0]._id, user: users[0]._id, rating:5, title:'Rất đẹp', text:'Sản phẩm đẹp, giao nhanh.' },
    { product: products[1]._id, user: users[1]._id, rating:4, title:'Chất lượng tốt', text:'Đẹp, đáng tiền.' },
    { product: products[2]._id, user: users[2]._id, rating:4, title:'Thanh lịch', text:'Phù hợp làm quà.' }
  ];
  for (const r of reviewsData) {
    const exists = await Review.findOne({ product: r.product, user: r.user });
    if (!exists) await Review.create(r);
  }
  console.log('Reviews ready');

  // Promos
  const promosData = [
    { title: 'Giảm 10% cho Nhẫn', type: 'product', product: products[0]._id, discountPercent: 10, startAt: new Date('2025-10-01'), endAt: new Date('2025-12-31'), active:true },
    { title: 'Khuyến mãi bộ sưu tập Cao cấp', type: 'collection', collection: collections[1]._id, discountAmount:200000, startAt:new Date('2025-10-01'), endAt:new Date('2025-11-30'), active:true },
    { title: 'Giảm 50k cho đơn trên 1 triệu', type: 'sitewide', discountAmount:50000, startAt:new Date('2025-10-15'), endAt:new Date('2025-12-31'), active:true }
  ];
  for (const p of promosData) {
    const ex = await Promo.findOne({ title: p.title });
    if (!ex) await Promo.create(p);
  }
  console.log('Promos ready');

  console.log('Seeding complete.');
  await mongoose.disconnect();
}

main().catch(err=>{ console.error(err); process.exit(1); });
