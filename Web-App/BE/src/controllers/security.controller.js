const { SecurityLog, SystemState } = require('../models/security.model');
const TempLog = require('../models/tempLog.model');

const UNLOCK_STATE_KEY = 'door-unlock-state';

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
        console.error('Error updating security log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Handle log from Python Edge AI and emit alerts
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
            status: 'active'
        });

        await newLog.save();

        if (io) {
            io.emit('new-alert', newLog);
            console.log(`📡 Emitted 'new-alert': ${title}`);
        }

        res.status(201).json({ success: true, data: newLog });
    } catch (error) {
        console.error('Error creating security log:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const logs = await SecurityLog.find()
            .sort({ timestamp: -1 })
            .limit(limit);

        res.json({ success: true, count: logs.length, data: logs });
    } catch (error) {
        console.error('Error getting security logs:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Check alert status for ESP32
exports.checkAlertStatus = async (req, res) => {
    try {
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
        console.error('Error checking alert status:', error);
        res.status(500).json({ alert: false, error: 'Server Error' });
    }
};

// Reset alarm with PIN verification
exports.resetAlarm = async (req, res) => {
    try {
        const { pin } = req.body;
        const io = req.app.get('socketio');

        const sysPin = process.env.ALARM_PIN || '1234';
        if (pin !== sysPin) {
            return res.status(401).json({ success: false, message: 'Invalid PIN!' });
        }

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
            message: "Alarm reset successfully",
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error resetting alarm:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Check unlock status for ESP32
exports.checkUnlockStatus = async (req, res) => {
    try {
        const state = await SystemState.findOne({ key: UNLOCK_STATE_KEY });

        if (state && state.shouldUnlock && state.unlockAt) {
            const elapsed = Date.now() - new Date(state.unlockAt).getTime();
            if (elapsed > 10000) {
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
        console.error('Error checking unlock status:', error);
        res.json({ shouldUnlock: false });
    }
};

// Trigger remote unlock
exports.triggerUnlock = async (req, res) => {
    try {
        const io = req.app.get('socketio');

        await SystemState.findOneAndUpdate(
            { key: UNLOCK_STATE_KEY },
            { shouldUnlock: true, unlockAt: new Date() },
            { upsert: true, new: true }
        );

        // Auto-lock after 10 seconds
        setTimeout(async () => {
            try {
                await SystemState.findOneAndUpdate(
                    { key: UNLOCK_STATE_KEY },
                    { shouldUnlock: false, unlockAt: null }
                );
                if (io) io.emit('door-locked', { timestamp: new Date() });
            } catch (err) { /* silent */ }
        }, 10000);

        if (io) io.emit('door-unlocked', { timestamp: new Date() });

        res.json({ success: true, message: 'Unlock triggered - auto lock in 10s' });
    } catch (error) {
        console.error('Error triggering unlock:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Log temperature and humidity from ESP32
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
        console.error('Error logging temperature:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.getTempHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await TempLog.find().sort({ timestamp: -1 }).limit(limit);
        res.json({ success: true, data: logs });
    } catch (error) {
        console.error('Error getting temp history:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Trigger face scan from Admin
exports.triggerFaceScan = async (req, res) => {
    try {
        await SystemState.findOneAndUpdate(
            { key: 'face-scan-state' },
            { shouldScan: true, scanAt: new Date() },
            { upsert: true, new: true }
        );

        setTimeout(async () => {
            try {
                await SystemState.findOneAndUpdate(
                    { key: 'face-scan-state' },
                    { shouldScan: false, scanAt: null }
                );
            } catch (err) { /* ignore */ }
        }, 30000);

        res.json({ success: true, message: 'Face scan triggered' });
    } catch (error) {
        console.error('Error triggering face scan:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// Check face scan status for ESP32-CAM
exports.checkFaceScanStatus = async (req, res) => {
    try {
        const state = await SystemState.findOne({ key: 'face-scan-state' });

        if (state && state.shouldScan && state.scanAt) {
            const elapsed = Date.now() - new Date(state.scanAt).getTime();
            if (elapsed > 30000) {
                await SystemState.findOneAndUpdate(
                    { key: 'face-scan-state' },
                    { shouldScan: false, scanAt: null }
                );
                return res.json({ shouldScan: false });
            }
            await SystemState.findOneAndUpdate(
                { key: 'face-scan-state' },
                { shouldScan: false, scanAt: null }
            );
            return res.json({ shouldScan: true });
        }

        res.json({ shouldScan: false });
    } catch (error) {
        console.error('Error checking face scan status:', error);
        res.json({ shouldScan: false });
    }
};

// Report Face ID scan result from ESP32-CAM
exports.reportFaceScanResult = async (req, res) => {
    try {
        const { success, name, message } = req.body;
        const io = req.app.get('socketio');

        // Clear the scan state
        await SystemState.findOneAndUpdate(
            { key: 'face-scan-state' },
            { shouldScan: false, scanAt: null, lastResult: { success, name, message, timestamp: new Date() } },
            { upsert: true }
        );

        // Emit result to Frontend via Socket.IO
        if (io) {
            io.emit('face-scan-result', {
                success,
                name,
                message,
                timestamp: new Date()
            });
            console.log(`📡 Emitted 'face-scan-result': ${success ? 'SUCCESS' : 'FAILED'} - ${name}`);
        }

        res.json({ success: true, message: 'Result received' });
    } catch (error) {
        console.error('Error reporting face scan result:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
