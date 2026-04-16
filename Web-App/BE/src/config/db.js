// src/config/db.js
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
      console.warn('  Warning: JWT_SECRET should be at least 16 characters long for security');
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Đã kết nối MongoDB thành công!");
  } catch (error) {
    console.error(" Kết nối MongoDB thất bại:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

