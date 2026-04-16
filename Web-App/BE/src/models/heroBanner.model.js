const mongoose = require('mongoose');

const heroBannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tiêu đề'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    // required: [true, 'Vui lòng upload ảnh banner'] // Comment để cho phép tạo banner mà không cần ảnh
  },
  buttonText: {
    type: String,
    default: 'Khám phá ngay'
  },
  buttonLink: {
    type: String,
    default: '/products'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  order: {
    type: Number,
    default: 0,
    comment: 'Thứ tự hiển thị, số nhỏ hơn hiển thị trước'
  }
}, {
  timestamps: true
});

// Index để tìm banner active nhanh
heroBannerSchema.index({ isActive: 1, order: 1 });

// Method để check banner có active trong khoảng thời gian không
heroBannerSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
};

const HeroBanner = mongoose.model('HeroBanner', heroBannerSchema);

module.exports = HeroBanner;
