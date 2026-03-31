const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { optionalAuth } = require('../middleware/auth.middleware');

// Sử dụng optionalAuth: Nếu có token thì lấy user, nếu không thì vẫn cho qua (Guest)
router.post('/ask', optionalAuth, chatbotController.askChatbot);

module.exports = router;
