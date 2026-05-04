// scripts/seed_coupons.js
// Run: node scripts/seed_coupons.js

require('dotenv').config({ path: './BE/.env' });
const mongoose = require('mongoose');
const Coupon = require('../BE/src/models/coupon.model');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  console.error('👉 Please create .env file in Web-App/BE/ directory');
  process.exit(1);
}

const coupons = [
  {
    code: 'BAO',
    description: 'Giảm 10% cho đơn hàng đầu tiên',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscountAmount: 500000,
    usageLimit: 100,
    onePerUser: false,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2027-12-31'),
    isActive: true
  },
  {
    code: 'GIAM50K',
    description: 'Giảm 50.000đ cho đơn từ 500.000đ',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderAmount: 500000,
    usageLimit: 50,
    onePerUser: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2027-12-31'),
    isActive: true
  },
  {
    code: 'FREESHIP',
    description: 'Miễn phí vận chuyển',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderAmount: 300000,
    usageLimit: null,
    onePerUser: false,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2027-12-31'),
    isActive: true
  },
  {
    code: 'SALE20',
    description: 'Giảm 20% tối đa 200.000đ',
    discountType: 'percent',
    discountValue: 20,
    minOrderAmount: 1000000,
    maxDiscountAmount: 200000,
    usageLimit: 30,
    onePerUser: true,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2027-12-31'),
    isActive: true
  }
];

async function seedCoupons() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing coupons
    await Coupon.deleteMany({});
    console.log('🗑️  Deleted old coupons');

    // Insert new coupons
    const result = await Coupon.insertMany(coupons);
    console.log(`✅ Created ${result.length} coupons:`);
    result.forEach(c => console.log(`   - ${c.code}: ${c.description}`));

    await mongoose.disconnect();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedCoupons();
