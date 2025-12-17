// scripts/seed_make_five.js
// Ensure at least 5 documents exist for key collections (idempotent)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Collection = require('../BE/src/models/collection.model');
const Product = require('../BE/src/models/product.model');
const User = require('../BE/src/models/user.model');
const Order = require('../BE/src/models/order.model');
const Review = require('../BE/src/models/review.model');
const Promo = require('../BE/src/models/promo.model');
const AdminLog = require('../BE/src/models/adminLog.model');
const Cart = require('../BE/src/models/cart.model');

async function ensureCollections(n = 5) {
  const count = await Collection.countDocuments();
  if (count >= n) return;
  const toCreate = n - count;
  for (let i = 0; i < toCreate; i++) {
    const slug = `auto-collection-${Date.now()}-${i}`;
    await Collection.create({ name: `Auto Collection ${i + 1}`, slug, description: 'Auto generated collection' });
  }
  console.log(`Collections increased to >= ${n}`);
}

async function ensureProducts(n = 5) {
  const count = await Product.countDocuments();
  const cols = await Collection.find().limit(10);
  const toCreate = Math.max(0, n - count);
  for (let i = 0; i < toCreate; i++) {
    const slug = `auto-product-${Date.now()}-${i}`;
    const doc = {
      name: `Auto Product ${i + 1}`,
      slug,
      price: 100000 + i * 10000,
      category: 'Auto',
      description: 'Auto generated product',
      images: [{ url: 'https://via.placeholder.com/400' }],
      stock: 50,
      collection: cols.length ? cols[i % cols.length]._id : undefined
    };
    await Product.create(doc);
  }
  if (toCreate) console.log(`Products increased to >= ${n}`);
}

async function ensureUsers(n = 5) {
  const count = await User.countDocuments();
  const toCreate = Math.max(0, n - count);
  const pwHash = await bcrypt.hash('pass1234', 10);
  for (let i = 0; i < toCreate; i++) {
    const idx = Date.now() + i;
    const email = `autouser${idx}@example.com`;
    await User.create({ name: `Auto User ${i + 1}`, email, password: pwHash, emailVerified: true });
  }
  if (toCreate) console.log(`Users increased to >= ${n}`);
}

async function ensureOrders(n = 5) {
  const count = await Order.countDocuments();
  const users = await User.find().limit(10);
  const products = await Product.find().limit(10);
  let created = 0;
  for (let i = 0; count + created < n && i < users.length; i++) {
    const u = users[i];
    // create simple order for user
    const p = products[i % products.length];
    const items = [{ product: p._id, qty: 1, price: p.price || p.priceSale || 100000 }];
    const total = items.reduce((s, it) => s + it.qty * it.price, 0);
    await Order.create({ user: u._id, items, total, status: 'pending', address: `Auto address ${i + 1}`, payment: { method: 'cod', status: 'pending' } });
    created++;
  }
  // if still short, create orders using first user
  const firstUser = users[0];
  while (count + created < n) {
    const p = products[0];
    const items = [{ product: p._id, qty: 1, price: p.price || p.priceSale || 100000 }];
    await Order.create({ user: firstUser._id, items, total: items[0].price, status: 'pending', address: 'Auto address extra', payment: { method: 'cod', status: 'pending' } });
    created++;
  }
  if (created) console.log(`Orders increased to >= ${n}`);
}

async function ensureReviews(n = 5) {
  const count = await Review.countDocuments();
  const users = await User.find().limit(10);
  const products = await Product.find().limit(10);
  let idx = 0;
  for (let i = 0; count + i < n; i++) {
    const u = users[i % users.length];
    const p = products[i % products.length];
    const exists = await Review.findOne({ product: p._id, user: u._id });
    if (exists) continue;
    await Review.create({ product: p._id, user: u._id, rating: 4, title: 'Đánh giá tự động', text: 'Auto review' });
    idx++;
  }
  if (idx) console.log(`Reviews increased to >= ${n}`);
}

async function ensurePromos(n = 5) {
  const count = await Promo.countDocuments();
  const cols = await Collection.find().limit(10);
  const products = await Product.find().limit(10);
  const toCreate = Math.max(0, n - count);
  for (let i = 0; i < toCreate; i++) {
    await Promo.create({ title: `Auto Promo ${Date.now()}-${i}`, type: 'sitewide', discountAmount: 10000 + i * 1000, startAt: new Date(), endAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), active: true });
  }
  if (toCreate) console.log(`Promos increased to >= ${n}`);
}

async function ensureAdminLogs(n = 5) {
  const count = await AdminLog.countDocuments();
  const admin = await User.findOne({ role: 'admin' }) || await User.findOne();
  const toCreate = Math.max(0, n - count);
  for (let i = 0; i < toCreate; i++) {
    await AdminLog.create({ admin: admin ? admin._id : undefined, action: `auto:seed_log_${i}`, message: `Auto generated admin log ${i + 1}`, ip: '127.0.0.1' });
  }
  if (toCreate) console.log(`AdminLogs increased to >= ${n}`);
}

async function ensureCarts(n = 5) {
  const count = await Cart.countDocuments();
  const users = await User.find().limit(10);
  const products = await Product.find().limit(10);
  let created = 0;
  for (let i = 0; count + created < n && i < users.length; i++) {
    const u = users[i];
    const exists = await Cart.findOne({ user: u._id });
    if (exists) continue;
    const p1 = products[i % products.length];
    const p2 = products[(i + 1) % products.length];
    await Cart.create({ user: u._id, items: [{ product: p1._id, qty: 1 }, { product: p2._id, qty: 2 }] });
    created++;
  }
  // if still short, create carts for first user with different items
  const firstUser = users[0];
  while (count + created < n) {
    await Cart.create({ user: firstUser._id, items: [{ product: products[0]._id, qty: 1 }] });
    created++;
  }
  if (created) console.log(`Carts increased to >= ${n}`);
}

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/thuongmaidientu';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', uri);
  const N = 5;
  await ensureCollections(N);
  await ensureProducts(N);
  await ensureUsers(N);
  await ensureOrders(N);
  await ensureReviews(N);
  await ensurePromos(N);
  await ensureAdminLogs(N);
  await ensureCarts(N);
  console.log('Ensure >=5 complete');
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
