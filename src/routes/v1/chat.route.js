const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/chat.controller');
const auth = require('../../middlewares/auth');

// Fetch chat history between two users
router.get('/history/:userId', chatController.getChatHistory);

router.get('/users/:role', auth('user', 'recruiter'), chatController.getUsers);

router.post('/:recipientId/messages', chatController.sendMessage);

// Block a user
router.post('/block', auth('user'), chatController.blockUser);

// Report a user
router.post('/report', auth('user'), chatController.reportUser);

module.exports = router;
