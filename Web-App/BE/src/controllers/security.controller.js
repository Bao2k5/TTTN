const { SecurityLog, SystemState } = require('../models/security.model');
const TempLog = require('../models/tempLog.model');

// UNLOCK STATE KEY - dùng singleton pattern trong MongoDB
const UNLOCK_STATE_KEY = 'door-unlock-state';

// @route   PUT /api/security/log/:id
exports.updateLog = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const io = req.app.get('socketio');

        const updatedLog = await SecurityLog.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedLog) {
            return res.status(404).json({ success: false, message: 'Log not found' });
        }

        if (io) {
            io.emit('update-alert', updatedLog);
        }

        res.json({ success: true, data: updatedLog });
    } catch (error) {
        console.error('Lỗi khi cập nhật Security Log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Nhận log từ Python Edge AI và phát cảnh báo
// @route   POST /api/security/log
exports.createLog = async (req, res) => {
    try {
        const { type, title, message, detectedName, imageUrl, videoUrl, videoPublicId } = req.body;
        const io = req.app.get('socketio');

        const newLog = new SecurityLog({
            type,
            title,
            message,
            detectedName,
            imageUrl,
            videoUrl,
            videoPublicId,
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
        // Tìm log WARNING/DANGER chưa được xử lý (active) trong 5 phút gần nhất
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

// @desc    API cho nhân viên tắt còi báo động (Cần mã PIN xác thực)
// @route   POST /api/security/reset-alarm
exports.resetAlarm = async (req, res) => {
    try {
        const { pin } = req.body;
        const io = req.app.get('socketio');

        // Basic PIN check (Default: 1234 or from ENV)
        const sysPin = process.env.ALARM_PIN || '1234';
        if (pin !== sysPin) {
            return res.status(401).json({ success: false, message: 'Sai mã PIN xác thực!' });
        }

        // Cập nhật tất cả log Active -> Resolved
        const result = await SecurityLog.updateMany(
            { status: 'active', type: { $in: ['WARNING', 'DANGER'] } },
            { $set: { status: 'resolved' } }
        );

        if (io) {
            io.emit('alarm-resolved', {
                processedBy: req.user ? req.user.name : 'Staff',
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

// @desc    ESP32 poll de kiem tra co mo khoa khong
// @route   GET /api/security/unlock-status
exports.checkUnlockStatus = async (req, res) => {
    try {
        const state = await SystemState.findOne({ key: UNLOCK_STATE_KEY });

        if (state && state.shouldUnlock && state.unlockAt) {
            const elapsed = Date.now() - new Date(state.unlockAt).getTime();
            if (elapsed > 10000) {
                // Tự động hết hạn sau 10 giây → reset trong DB
                await SystemState.findOneAndUpdate(
                    { key: UNLOCK_STATE_KEY },
                    { shouldUnlock: false, unlockAt: null }
                );
                return res.json({ shouldUnlock: false });
            }
            return res.json({ shouldUnlock: true });
        }

        res.json({ shouldUnlock: false });
    } catch (error) {
        console.error('Lỗi check unlock:', error);
        res.json({ shouldUnlock: false });
    }
};

// @desc    AI/Web goi de mo khoa tu xa
// @route   POST /api/security/trigger-unlock
exports.triggerUnlock = async (req, res) => {
    try {
        const io = req.app.get('socketio');

        // Lưu trạng thái mở khoá vào MongoDB (upsert = tạo nếu chưa có)
        await SystemState.findOneAndUpdate(
            { key: UNLOCK_STATE_KEY },
            { shouldUnlock: true, unlockAt: new Date() },
            { upsert: true, new: true }
        );

        // Tự động khoá lại sau 10 giây
        setTimeout(async () => {
            try {
                await SystemState.findOneAndUpdate(
                    { key: UNLOCK_STATE_KEY },
                    { shouldUnlock: false, unlockAt: null }
                );
                if (io) io.emit('door-locked', { timestamp: new Date() });
            } catch (err) {
                console.error('Lỗi auto-lock:', err);
            }
        }, 10000);

        if (io) io.emit('door-unlocked', { timestamp: new Date() });

        res.json({ success: true, message: 'Unlock triggered - auto lock in 10s' });
    } catch (error) {
        console.error('Lỗi trigger unlock:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Lưu log nhiệt độ từ ESP32
// @route   POST /api/security/temp-log
exports.logTemperature = async (req, res) => {
    try {
        const { temp, humi } = req.body;
        if (temp === undefined || humi === undefined) {
            return res.status(400).json({ msg: 'Missing temperature or humidity' });
        }

        const newLog = await TempLog.create({
            temperature: temp,
            humidity: humi
        });

        res.status(201).json({ success: true, data: newLog });
    } catch (error) {
        console.error('Lỗi lưu Temp Log:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    Lấy lịch sử nhiệt độ (để vẽ biểu đồ)
// @route   GET /api/security/temp-history
exports.getTempHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await TempLog.find().sort({ timestamp: -1 }).limit(limit);
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Lỗi lấy Temp History:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
// @desc    Admin kích hoạt yêu cầu quét khuôn mặt
// @route   POST /api/security/face-scan-trigger
exports.triggerFaceScan = async (req, res) => {
    try {
        // Lưu trạng thái "cần quét mặt" vào MongoDB (timeout 30s)
        await SystemState.findOneAndUpdate(
            { key: 'face-scan-state' },
            { shouldScan: true, scanAt: new Date() },
            { upsert: true, new: true }
        );

        // Tự động hủy lệnh sau 30 giây nếu ESP32-CAM không nhận
        setTimeout(async () => {
            try {
                await SystemState.findOneAndUpdate(
                    { key: 'face-scan-state' },
                    { shouldScan: false, scanAt: null }
                );
            } catch (err) { /* ignore */ }
        }, 30000);

        res.json({ success: true, message: 'Face scan triggered. ESP32-CAM will scan in next cycle.' });
    } catch (error) {
        console.error('Lỗi trigger face scan:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @desc    ESP32-CAM poll để kiểm tra có cần quét mặt không
// @route   GET /api/security/face-scan-status
exports.checkFaceScanStatus = async (req, res) => {
    try {
        const state = await SystemState.findOne({ key: 'face-scan-state' });

        if (state && state.shouldScan && state.scanAt) {
            const elapsed = Date.now() - new Date(state.scanAt).getTime();
            if (elapsed > 30000) {
                // Hết hạn 30 giây
                await SystemState.findOneAndUpdate(
                    { key: 'face-scan-state' },
                    { shouldScan: false, scanAt: null }
                );
                return res.json({ shouldScan: false });
            }
            // Reset ngay sau khi ESP32-CAM nhận lệnh (one-shot)
            await SystemState.findOneAndUpdate(
                { key: 'face-scan-state' },
                { shouldScan: false, scanAt: null }
            );
            return res.json({ shouldScan: true });
        }

        res.json({ shouldScan: false });
    } catch (error) {
        console.error('Lỗi check face scan:', error);
        res.json({ shouldScan: false });
    }
};
