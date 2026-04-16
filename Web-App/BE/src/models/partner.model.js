const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,  // URL hoặc tên file từ /public/images/partners/
      required: true,
    },
    url: {
      type: String,  // Link đến website partner
      default: '#',
    },
    description: {
      type: String,
      default: '',
    },
    displayFrom: {
      type: Date,
      default: new Date(),  // Ngày bắt đầu hiển thị
    },
    displayTo: {
      type: Date,
      default: null,  // Ngày kết thúc (null = vĩnh viễn)
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    position: {
      type: Number,
      default: 0,  // Thứ tự hiển thị
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Partner', partnerSchema);
