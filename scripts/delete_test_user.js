// Delete user by email for testing
// Usage: node scripts/delete_test_user.js

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../BE/src/models/user.model');

const emailToDelete = 'leduongbao2019@gmail.com';

async function deleteUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const result = await User.deleteOne({ email: emailToDelete });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted user: ${emailToDelete}`);
    } else {
      console.log(`⚠️ User not found: ${emailToDelete}`);
    }

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteUser();
