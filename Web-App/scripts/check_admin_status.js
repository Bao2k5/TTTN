require('dotenv').config({ path: '../BE/.env' });
const mongoose = require('mongoose');
const User = require('../BE/src/models/user.model');

async function check() {
  try {
    console.log('Connecting to:', process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB');

    const admin = await User.findOne({ email: 'admin@example.com' });
    if (admin) {
      console.log('✅ Found Admin:', admin.email, '| Role:', admin.role);
    } else {
      console.log('❌ Admin NOT FOUND');
    }

    const userCount = await User.countDocuments();
    console.log('📊 Total Users:', userCount);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

check();
