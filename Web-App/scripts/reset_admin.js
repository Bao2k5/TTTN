const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../BE/src/models/user.model');
const bcrypt = require('bcryptjs');

// Try to load .env from BE folder first, then current folder
const envPath1 = path.join(__dirname, '../BE/.env'); // Web-App/BE/.env
const envPath2 = path.join(__dirname, '../.env');    // Web-App/.env

let config = dotenv.config({ path: envPath1 });
if (config.error) {
  console.log(`⚠️ Không tìm thấy ở: ${envPath1}`);
  config = dotenv.config({ path: envPath2 });
}

if (config.error || !process.env.MONGO_URI) {
  console.error('❌ KHÔNG TÌM THẤY FILE .ENV HOẶC MONGO_URI!');
  console.log('👉 Vui lòng kiểm tra file .env nằm ở đâu.');
  process.exit(1);
}

console.log('✅ Đã load cấu hình từ .env');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to DB thành công!');

    const email = 'admin@example.com';
    const password = 'admin123';

    // Xóa admin cũ nếu có
    await User.deleteOne({ email });

    // Tạo admin mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      name: 'Admin System',
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log(`🎉 TẠO ADMIN THÀNH CÔNG!`);
    console.log(`👉 Email: ${email}`);
    console.log(`👉 Pass:  ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

resetAdmin();
