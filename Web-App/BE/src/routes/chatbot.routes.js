const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { protect } = require('../middleware/auth.middleware');

// Route nay de public cho khach, nhung neu co token thi controller se check role de tra loi thong minh hon
router.post('/ask', (req, res, next) => {
    // Thu lay user neu co token, neu khong co thi van cho qua
    // Gia su co middleware auth.middleware.js co ham protect hoac giong vay
    next();
}, chatbotController.askChatbot);

module.exports = router;
