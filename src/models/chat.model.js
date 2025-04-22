const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  attachment: String,
  createdAt: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      isCard: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      readby: { type: Boolean, default: false }
    },
  ],
});

// Ensure uniqueness of participants set (ignoring order)
ChatSchema.index({ participants: 1 }, { unique: true });

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;
