// Script xóa user khỏi database theo email
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../BE/src/models/user.model');

const deleteUserByEmail = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/thuongmaidientu');
    console.log('✅ Connected to MongoDB');

    // Tìm user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ Không tìm thấy user với email: ${email}`);
      process.exit(0);
    }

    console.log(`\n📋 Tìm thấy user:`);
    console.log(`   - ID: ${user._id}`);
    console.log(`   - Name: ${user.name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Verified: ${user.verified || false}`);
    console.log(`   - Deleted flag: ${user.deleted || false}\n`);

    // Xóa THẬT khỏi database
    await User.deleteOne({ email });
    
    console.log(`✅ ĐÃ XÓA user ${email} khỏi database!`);
    console.log(`   → Email này có thể đăng ký lại ngay\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

// Lấy email từ command line
const email = process.argv[2];

if (!email) {
  console.log('\n❌ Vui lòng cung cấp email!');
  console.log('   Cách dùng: node scripts/force_delete_user.js <email>\n');
  console.log('   Ví dụ: node scripts/force_delete_user.js leduongbao2019@gmail.com\n');
  process.exit(1);
}

deleteUserByEmail(email);
