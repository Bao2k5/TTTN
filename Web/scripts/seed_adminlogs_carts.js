// scripts/seed_adminlogs_carts.js
// Create 3 adminlogs and 3 carts referencing existing users/products/admin.
require('dotenv').config();
const mongoose = require('mongoose');
const AdminLog = require('../BE/src/models/adminLog.model');
const Cart = require('../BE/src/models/cart.model');
const User = require('../BE/src/models/user.model');
const Product = require('../BE/src/models/product.model');

async function main(){
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/thuongmaidientu';
  await mongoose.connect(uri);
  console.log('Connected to', uri);

  // find an admin
  const admin = await User.findOne({ role: 'admin' });
  const adminId = admin ? admin._id : null;

  // find three users (fallback to any users)
  let users = await User.find({ role: 'user' }).limit(3);
  if (users.length < 3) {
    users = await User.find().limit(3);
  }

  // find products to reference
  const products = await Product.find().limit(3);

  // Create admin logs
  const logs = [
    { admin: adminId, action: 'seed:add_adminlogs', message: 'Inserted sample admin logs', ip: '127.0.0.1' },
    { admin: adminId, action: 'seed:update_stock', message: 'Updated sample stock values', ip: '127.0.0.1' },
    { admin: adminId, action: 'seed:create_promo', message: 'Created sample promos', ip: '127.0.0.1' }
  ];
  for (const l of logs){
    const exists = await AdminLog.findOne({ action: l.action, message: l.message });
    if (!exists) await AdminLog.create(l);
  }
  console.log('Admin logs seeded');

  // Create carts for the users
  for (let i=0;i<users.length;i++){
    const u = users[i];
    const existing = await Cart.findOne({ user: u._id });
    if (existing) continue;
    const p1 = products[i % products.length];
    const p2 = products[(i+1) % products.length];
    const cart = { user: u._id, items: [ { product: p1._id, qty: 1 }, { product: p2._id, qty: 2 } ] };
    await Cart.create(cart);
  }
  console.log('Carts seeded');

  await mongoose.disconnect();
}

main().catch(err=>{ console.error(err); process.exit(1); });
