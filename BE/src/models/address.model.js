// src/models/address.model.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true // Index for faster queries
  },
  fullName: { 
    type: String, 
    required: [true, 'Họ tên là bắt buộc'],
    trim: true 
  },
  phone: { 
    type: String, 
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  province: { 
    type: String, 
    required: [true, 'Tỉnh/Thành phố là bắt buộc'],
    trim: true 
  },
  district: { 
    type: String, 
    required: [true, 'Quận/Huyện là bắt buộc'],
    trim: true 
  },
  ward: { 
    type: String, 
    required: [true, 'Phường/Xã là bắt buộc'],
    trim: true 
  },
  address: { 
    type: String, 
    required: [true, 'Địa chỉ chi tiết là bắt buộc'],
    trim: true 
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  label: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home'
  }
}, { 
  timestamps: true 
});

// Middleware: Khi set isDefault = true, tự động set các địa chỉ khác của user về false
addressSchema.pre('save', async function(next) {
  if (this.isModified('isDefault') && this.isDefault === true) {
    // Set all other addresses of this user to isDefault = false
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

// Method để lấy địa chỉ đầy đủ
addressSchema.methods.getFullAddress = function() {
  return `${this.address}, ${this.ward}, ${this.district}, ${this.province}`;
};

// Static method để lấy địa chỉ mặc định của user
addressSchema.statics.getDefaultAddress = async function(userId) {
  return await this.findOne({ userId, isDefault: true });
};

module.exports = mongoose.model('Address', addressSchema);
