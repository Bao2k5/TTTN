const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');

// @route   POST /api/security/log
router.post('/log', securityController.createLog);

// @route   GET /api/security/logs
router.get('/logs', securityController.getLogs);

// @route   GET /api/security/alert-status
router.get('/alert-status', securityController.checkAlertStatus);

// @route   POST /api/security/reset-alarm
router.post('/reset-alarm', securityController.resetAlarm);

module.exports = router;
