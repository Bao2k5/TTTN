const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');

// @route   POST /api/security/log
router.post('/log', securityController.createLog);

// @route   GET /api/security/logs
router.get('/logs', securityController.getLogs);

// @route   PUT /api/security/log/:id
router.put('/log/:id', securityController.updateLog);

// @route   GET /api/security/alert-status
router.get('/alert-status', securityController.checkAlertStatus);

// @route   POST /api/security/reset-alarm
router.post('/reset-alarm', securityController.resetAlarm);

// @route   GET /api/security/unlock-status
router.get('/unlock-status', securityController.checkUnlockStatus);

// @route   POST /api/security/trigger-unlock
router.post('/trigger-unlock', securityController.triggerUnlock);

// @route   POST /api/security/temp-log
router.post('/temp-log', securityController.logTemperature);

// @route   GET /api/security/temp-history
router.get('/temp-history', securityController.getTempHistory);

module.exports = router;
