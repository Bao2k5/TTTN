// Script tạo admin account
require('dotenv').config({ path: './BE/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../BE/src/models/user.model');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'admin@example.com';
    const password = 'admin123';
    const name = 'Admin';

    // Check if admin exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('\n⚠️  Admin đã tồn tại!');
      console.log('   Email:', existing.email);
      console.log('   Name:', existing.name);
      console.log('   Role:', existing.role);
      
      // Update password if needed
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      await User.findByIdAndUpdate(existing._id, { 
        password: hashed,
        role: 'admin',
        verified: true,
        emailVerified: true
      });
      console.log('\n✅ Đã cập nhật mật khẩu admin!');
    } else {
      // Create new admin
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const admin = await User.create({
        name,
        email,
        password: hashed,
        role: 'admin',
        verified: true,
        emailVerified: true
      });

      console.log('\n✅ ĐÃ TẠO ADMIN THÀNH CÔNG!');
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Role:', admin.role);
    }

    console.log('\n📋 THÔNG TIN ĐĂNG NHẬP:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('\n🔗 Đăng nhập tại: http://localhost:3001/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

createAdmin();
