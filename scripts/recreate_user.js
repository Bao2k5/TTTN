// Tạo lại user cũ để test
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../BE/src/models/user.model');

require('dotenv').config();

async function recreateUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/thuongmaidientu');
    console.log('✅ Connected to MongoDB');

    // Xóa user cũ nếu có
    await User.deleteOne({ email: 'leduongbao2019@gmail.com' });

    // Tạo lại user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const user = await User.create({
      name: 'Lê Dương Bảo',
      email: 'leduongbao2019@gmail.com',
      password: hashedPassword,
      phone: '0123456789',
      emailVerified: true
    });

    console.log('✅ User recreated successfully');
    console.log('Email: leduongbao2019@gmail.com');
    console.log('Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

recreateUser();
