const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { verifyToken, isAdmin, verifyDeviceKey } = require('../middleware/auth.middleware');

// --- IoT & AI Specific Routes (ESP32, ESP32-CAM, Python Edge AI) ---
// These routes allow access via x-device-key header OR Admin JWT
router.post('/temp-log', verifyDeviceKey, securityController.logTemperature);
router.get('/alert-status', verifyDeviceKey, securityController.checkAlertStatus);
router.get('/unlock-status', verifyDeviceKey, securityController.checkUnlockStatus);
router.get('/face-scan-status', verifyDeviceKey, securityController.checkFaceScanStatus);
router.post('/reset-alarm', verifyDeviceKey, securityController.resetAlarm);
router.post('/log', verifyDeviceKey, securityController.createLog);
router.put('/log/:id', verifyDeviceKey, securityController.updateLog);
router.post('/trigger-unlock', verifyDeviceKey, securityController.triggerUnlock);

// --- Admin & Web Routes ---
// These routes REQUIRE full Admin authentication
router.use(verifyToken, isAdmin);

// @route   GET /api/security/logs
router.get('/logs', securityController.getLogs);

// @route   GET /api/security/temp-history
router.get('/temp-history', securityController.getTempHistory);

// @route   POST /api/security/face-scan-trigger
router.post('/face-scan-trigger', securityController.triggerFaceScan);

module.exports = router;
