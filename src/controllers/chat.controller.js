const ChatService = require('../services/chat.service'); // Import ChatService

const getChatHistory = async (req, res) => {
  const { userId } = req.params; // ID of the other user in the chat
  const { currentUserId } = req.query; // ID of the current logged-in user

  try {
    const chat = await ChatService.getChatHistory(currentUserId, userId); // Use ChatService

    if (!chat) {
      return res.status(404).json({ success: false, message: 'No chat history found' });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const blockUser = async (req, res) => {
  const { userId, blockedUserId } = req.body;

  try {
    await ChatService.blockUser(userId, blockedUserId); // Use ChatService to block user
    res.status(200).send({ success: true, message: 'User blocked successfully.' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Failed to block user.', error: error.message });
  }
};

const reportUser = async (req, res) => {
  const { userId, reportedUserId } = req.body;

  try {
    await ChatService.reportUser(userId, reportedUserId); // Use ChatService to report user
    res.status(200).send({ success: true, message: 'User reported successfully.' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Failed to report user.', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role } = req.params;
    const { id } = req.user
    if (!id) res.status(200).json({ success: false, message: "Nor User id found for chats" });
    const users = await ChatService.getUsers(role, id); // Use ChatService to get users
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }


};
const sendMessage = async (req, res) => {
  try {
    let { recipientId } = req.params;
    let { message } = req.body;
    let { senderId } = req.query; // Assuming `authenticate` middleware sets req.user

    if (!message) {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    const newMessage = await ChatService.saveMessage(
      senderId,
      recipientId,
      message
    );

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getChatHistory,
  blockUser,
  reportUser,
  getUsers,
  sendMessage
};
