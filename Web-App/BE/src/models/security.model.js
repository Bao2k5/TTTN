const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['INFO', 'WARNING', 'DANGER'],
        default: 'INFO',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    detectedName: {
        type: String, // Tên người được nhận diện (nếu có)
        default: 'Unknown'
    },
    imageUrl: {
        type: String, // URL ảnh bằng chứng (Cloudinary/S3)
        default: ''
    },
    videoUrl: {
        type: String, // URL video bằng chứng
        default: ''
    },
    videoPublicId: {
        type: String, // Public ID của video trên Cloudinary
        default: ''
    },
    deviceId: {
        type: String,
        default: 'Camera-01'
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Tự động thêm createdAt, updatedAt
});

// Schema lưu trạng thái hệ thống (unlock, alarm...) - thay cho biến in-memory
const systemStateSchema = new mongoose.Schema({
    key: {
        type: String,
        unique: true,
        required: true
    },
    shouldUnlock: {
        type: Boolean,
        default: false
    },
    unlockAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);
const SystemState = mongoose.model('SystemState', systemStateSchema);

module.exports = { SecurityLog, SystemState };

