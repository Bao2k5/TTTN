// src/models/user.model.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    // OTP for password reset
    resetCode: { type: String },
    resetCodeExpire: { type: Date },
    // OTP for email verification (registration)
    otp: { type: String },
    otpExpire: { type: Date },
    verified: { type: Boolean, default: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    emailVerified: { type: Boolean, default: false },
    verifyEmailToken: { type: String },
    deleted: { type: Boolean, default: false },
    addresses: [
      {
        label: { type: String },
        name: { type: String },
        phone: { type: String },
        line1: { type: String },
        city: { type: String },
        province: { type: String },
        postalCode: { type: String }
      }
    ],
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model("User", userSchema);
