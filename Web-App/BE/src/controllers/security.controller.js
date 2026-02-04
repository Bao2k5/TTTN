const SecurityLog = require('../models/security.model');

// @desc    Nhận log từ Python Edge AI và phát cảnh báo
// @route   POST /api/security/log
exports.createLog = async (req, res) => {
    try {
        const { type, title, message, detectedName, imageUrl } = req.body;
        const io = req.app.get('socketio');

        const newLog = new SecurityLog({
            type,
            title,
            message,
            detectedName,
            imageUrl,
            status: 'active' // Mặc định là active
        });

        await newLog.save();

        // 🚀 Real-time Notify
        if (io) {
            io.emit('new-alert', newLog);
            console.log(`📡 Emitted 'new-alert': ${title}`);
        }

        res.status(201).json({ success: true, data: newLog });
    } catch (error) {
        console.error('Lỗi khi lưu Security Log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Lấy lịch sử cảnh báo
// @route   GET /api/security/logs
exports.getLogs = async (req, res) => {
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
};

// @desc    API cho ESP32 gọi để kiểm tra có báo động không
// @route   GET /api/security/alert-status
exports.checkAlertStatus = async (req, res) => {
    try {
        // Tìm log WARNING/DANGER chưa được xử lý (active) trong 30s gần nhất
        // Hoặc cứ active là hú (nhân viên phải tắt thủ công) -> Chọn cách này an toàn hơn
        
        // Tuy nhiên để tránh ESP32 hú mãi vì log cũ quên tắt, ta combine cả 2:
        // Active AND (trong 5 phút gần đây HOẶC vừa mới xảy ra)
        
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        const activeAlert = await SecurityLog.findOne({
            type: { $in: ['WARNING', 'DANGER'] },
            status: 'active',
            timestamp: { $gte: fiveMinutesAgo } 
        }).sort({ timestamp: -1 });

        if (activeAlert) {
            return res.json({ 
                shouldAlert: true, 
                message: "INTRUSION DETECTED", 
                type: activeAlert.type 
            });
        }

        res.json({ shouldAlert: false, message: "SAFE" });
    } catch (error) {
        console.error('Lỗi check status:', error);
        res.status(500).json({ alert: false, error: 'Server Error' });
    }
};

// @desc    API cho nhân viên tắt còi báo động (Soft Delete/Resolve)
// @route   POST /api/security/reset-alarm
exports.resetAlarm = async (req, res) => {
    try {
        const io = req.app.get('socketio');

        // Cập nhật tất cả log Active -> Resolved
        const result = await SecurityLog.updateMany(
            { status: 'active', type: { $in: ['WARNING', 'DANGER'] } },
            { $set: { status: 'resolved' } }
        );

        if (io) {
            io.emit('alarm-resolved', { 
                processedBy: 'Staff', 
                timestamp: new Date() 
            });
        }

        res.json({ 
            success: true, 
            message: "Alarm reset successfully (Logs marked as resolved)", 
            modifiedCount: result.modifiedCount 
        });
    } catch (error) {
        console.error('Lỗi reset alarm:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
