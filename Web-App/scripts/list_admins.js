require('dotenv').config({ path: '../BE/.env' });
const mongoose = require('mongoose');
const User = require('../BE/src/models/user.model');

async function listAdmins() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to DB');

        // Find all users where role is 'admin'
        const admins = await User.find({ role: 'admin' }).select('name email role');

        if (admins.length === 0) {
            console.log('❌ Không tìm thấy tài khoản Admin nào trong Database này!');
        } else {
            console.log('📋 DANH SÁCH ADMIN TÌM THẤY:');
            admins.forEach(admin => {
                console.log(`- Tên: ${admin.name} | Email: ${admin.email}`);
            });
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listAdmins();
