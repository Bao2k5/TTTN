// Reset admin user
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../BE/src/models/user.model');

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ email: 'admin@example.com' });
    console.log('🗑️  Deleted old admin user');

    // Create new admin with fresh password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      emailVerified: true
    });

    console.log('✅ Created new admin user:');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   ID:', admin._id);

    // Test the password
    const testMatch = await bcrypt.compare('admin123', hashedPassword);
    console.log('🔐 Password test:', testMatch ? '✅ PASS' : '❌ FAIL');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdmin();
