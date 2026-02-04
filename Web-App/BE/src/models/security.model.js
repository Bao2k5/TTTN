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

module.exports = mongoose.model('SecurityLog', securityLogSchema);
