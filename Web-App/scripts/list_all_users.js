require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Define User schema inline
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  verified: Boolean,
  createdAt: Date
}, { strict: false });

const User = mongoose.model('User', userSchema);

async function listUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('\n=== TẤT CẢ USERS TRONG DATABASE ===\n');

    const users = await User.find({}).sort({ createdAt: -1 });
    
    if (users.length === 0) {
      console.log('❌ Không có user nào trong database!');
    } else {
      users.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.email}`);
        console.log(`   Name: ${u.name}`);
        console.log(`   Verified: ${u.verified ? '✅ TRUE' : '❌ FALSE'}`);
        console.log(`   Created: ${u.createdAt}`);
        console.log(`   ID: ${u._id}\n`);
      });
      console.log(`📊 TỔNG: ${users.length} users`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

listUsers();
