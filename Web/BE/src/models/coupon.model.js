// src/models/coupon.model.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  description: { type: String },
  discountType: { 
    type: String, 
    enum: ['percent', 'fixed'], 
    default: 'percent' 
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: 0
  },
  minOrderAmount: { 
    type: Number, 
    default: 0 
  },
  maxDiscountAmount: { 
    type: Number // Giới hạn tối đa giảm (cho loại percent)
  },
  usageLimit: { 
    type: Number, 
    default: null // null = không giới hạn
  },
  usedCount: { 
    type: Number, 
    default: 0 
  },
  usedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  onePerUser: { 
    type: Boolean, 
    default: true // Mỗi user chỉ dùng 1 lần
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

// Method kiểm tra coupon còn hiệu lực
couponSchema.methods.isValid = function(userId, orderAmount) {
  const now = new Date();
  
  // Check active
  if (!this.isActive) return { valid: false, message: 'Mã giảm giá đã bị vô hiệu hóa' };
  
  // Check date range
  if (now < this.startDate) return { valid: false, message: 'Mã giảm giá chưa có hiệu lực' };
  if (now > this.endDate) return { valid: false, message: 'Mã giảm giá đã hết hạn' };
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
  }
  
  // Check one per user
  if (this.onePerUser && userId && this.usedBy.includes(userId)) {
    return { valid: false, message: 'Bạn đã sử dụng mã này rồi' };
  }
  
  // Check minimum order
  if (orderAmount < this.minOrderAmount) {
    return { valid: false, message: `Đơn hàng tối thiểu ${this.minOrderAmount.toLocaleString('vi-VN')}đ` };
  }
  
  return { valid: true, message: 'OK' };
};

// Method tính discount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'percent') {
    discount = Math.round(orderAmount * (this.discountValue / 100));
    // Apply max discount cap
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else {
    discount = this.discountValue;
  }
  
  // Don't exceed order amount
  return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);
