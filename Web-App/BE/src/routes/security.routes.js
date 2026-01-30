const express = require('express');
const router = express.Router();
const SecurityLog = require('../models/security.model');

// @route   POST /api/security/log
// @desc    Nhận log từ Python Edge AI
// @access  Public (Trong thực tế nên dùng API Key, nhưng demo châm chước)
router.post('/log', async (req, res) => {
    try {
        const { type, title, message, detectedName, imageUrl } = req.body;

        const newLog = new SecurityLog({
            type,
            title,
            message,
            detectedName,
            imageUrl
        });

        await newLog.save();

        // TODO: Emit Socket.IO event here for Real-time update

        res.status(201).json({ success: true, data: newLog });
    } catch (error) {
        console.error('Lỗi khi lưu Security Log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/security/logs
// @desc    Lấy lịch sử cảnh báo (cho Admin Dashboard)
// @access  Public (Hoặc Admin Auth)
router.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const logs = await SecurityLog.find()
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        console.error('Lỗi khi lấy Security Logs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @route   GET /api/security/alert-status
// @desc    API cho ESP32 gọi để kiểm tra có báo động không
// @access  Public
router.get('/alert-status', async (req, res) => {
    try {
        // Tìm log WARNING hoặc DANGER mới nhất trong 30 giây qua
        const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);

        const recentAlert = await SecurityLog.findOne({
            type: { $in: ['WARNING', 'DANGER'] },
            timestamp: { $gte: thirtySecondsAgo }
        }).sort({ timestamp: -1 });

        if (recentAlert) {
            return res.json({ shouldAlert: true, message: "INTRUSION DETECTED", type: recentAlert.type });
        }

        res.json({ shouldAlert: false, message: "SAFE" });
    } catch (error) {
        console.error('Lỗi check status:', error);
        res.status(500).json({ alert: false, error: 'Server Error' });
    }
});

// @route   POST /api/security/reset-alarm
// @desc    API cho nhân viên tắt còi báo động
// @access  Public (hoặc Staff Auth)
router.post('/reset-alarm', async (req, res) => {
    try {
        // Xóa tất cả cảnh báo gần đây để tắt còi
        const result = await SecurityLog.deleteMany({
            type: { $in: ['WARNING', 'DANGER'] },
            timestamp: { $gte: new Date(Date.now() - 60 * 1000) } // Xóa trong 60s qua
        });

        res.json({ success: true, message: "Alarm reset successfully", deletedCount: result.deletedCount });
    } catch (error) {
        console.error('Lỗi reset alarm:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;
