require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', process.env.MONGO_URI);
    const users = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
    console.log('Sample users found:', users.map(u=>({email:u.email, role:u.role, _id:u._id}))); 
    const admin = await mongoose.connection.db.collection('users').findOne({ email: 'admin@example.com' });
    if (admin) console.log('Admin user exists:', {email: admin.email, role: admin.role, _id: admin._id});
    else console.log('Admin user not found');
    process.exit(0);
  } catch (err) {
    console.error('DB error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
