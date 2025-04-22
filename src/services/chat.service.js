const { AppliedJobs, Order } = require('../models');
const { Chat } = require('../models'); // Import the Chat model
const mongoose = require('mongoose');

/**
 * Chat Service: Handles chat-related business logic.
 */
const ChatService = {

  /**
 * Get chat history between two users.
 *
 * @param {string} currentUserId - ID of the logged-in user.
 * @param {string} userId - ID of the other user in the chat.
 * @returns {Promise<Object>} - Chat document containing messages.
 */
  async getChatHistory(currentUserId, userId) {
    try {
      const chat = await Chat.findOneAndUpdate(
        {
          participants: { $all: [currentUserId, userId] }
        },
        {
          $set: {
            'messages.$[elem].readby': true
          }
        },
        {
          arrayFilters: [{ 'elem.sender': userId }],
          new: true
        }
      ).select('messages');
      if (!chat) {
        return { message: 'Chat not found.' };
      }

      // Fetch orders related to this chat
      const orders = await Order.find({ chat_id: chat._id })
      if (orders) {
        return { chat, orders }
      }
      return chat;

    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw new Error('Unable to fetch chat history.');
    }
  },


  // async getChatHistory(currentUserId, userId) {
  //   try {
  //     const chat = await Chat.findOne({
  //       participants: { $all: [currentUserId, userId] },
  //     }).select('messages');
  //     return chat;
  //   } catch (error) {
  //     console.error('Error fetching chat history:', error);
  //     throw new Error('Unable to fetch chat history.');
  //   }
  // },

  /**
   * Save a message in the chat between two participants.
   * Creates a new chat if it doesn't exist.
   *
   * @param {string} senderId - ID of the sender.
   * @param {string} recipientId - ID of the recipient.
   * @param {string} message - Message text.
   * @returns {Promise<Object>} - Updated chat document.
   */
  async saveMessage(senderId, recipientId, message) {
    try {

      console.log(recipientId, senderId, "id inside here ");
      // Convert sender and recipient IDs to ObjectId
      const senderObjectId = new mongoose.Types.ObjectId(senderId);
      const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

      const card = message.split("||")[1] == "OrderRequestCard"

      console.log(senderObjectId, recipientObjectId, "id inside here ");
      // Sort participants to ensure consistency
      const sortedParticipants = [senderObjectId, recipientObjectId].sort();
      console.log('Sorted Participants:', sortedParticipants);

      // Attempt to find the chat
      let chat = await Chat.findOne({ participants: { $all: sortedParticipants } });

      if (!chat) {
        // If no chat exists, create one
        chat = new Chat({
          participants: sortedParticipants,
          messages: [{
            sender: senderObjectId,
            text: message,
            isCard: card ? card : false,
            createdAt: new Date(),
          }],
        });
      } else {
        // If chat exists, add the new message
        chat.messages.push({
          sender: senderObjectId,
          text: message,
          isCard: card ? card : false,
          createdAt: new Date(),
        });
      }

      // Save the chat (whether new or updated)
      await chat.save();

      return chat;
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Unable to save message.');
    }
  },


  /**
   * Block a user in a chat.
   *
   * @param {string} userId - ID of the user performing the block.
   * @param {string} blockedUserId - ID of the user to be blocked.
   * @returns {Promise<void>}
   */
  async blockUser(userId, blockedUserId) {
    try {
      await Chat.updateMany(
        { participants: { $all: [userId, blockedUserId] } },
        { $addToSet: { blockedBy: userId } } // Add the blocking user to the `blockedBy` array
      );
    } catch (error) {
      console.error('Error blocking user:', error);
      throw new Error('Unable to block user.');
    }
  },

  /**
   * Report a user in a chat.
   *
   * @param {string} userId - ID of the user reporting.
   * @param {string} reportedUserId - ID of the user being reported.
   * @returns {Promise<void>}
   */
  async reportUser(userId, reportedUserId) {
    try {
      await Chat.updateMany(
        { participants: { $all: [userId, reportedUserId] } },
        { $addToSet: { reportedBy: userId } } // Add the reporting user to the `reportedBy` array
      );
    } catch (error) {
      console.error('Error reporting user:', error);
      throw new Error('Unable to report user.');
    }
  },

  /**
   * Mark all messages as read in a chat for a user.
   *
   * @param {string} chatId - ID of the chat.
   * @param {string} userId - ID of the user marking messages as read.
   * @returns {Promise<void>}
   */
  async markMessagesAsRead(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId);
      if (!chat) {
        throw new Error('Chat not found.');
      }

      chat.messages.forEach((message) => {
        if (message.sender !== userId && !message.read) {
          message.read = true; // Mark the message as read
        }
      });

      await chat.save();
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error('Unable to mark messages as read.');
    }
  },

  async getUsers(role, userId) {
    try {
      console.log(userId, "user id here in data")
      if (role == 'recruiter') {
        const users = await AppliedJobs.aggregate([
          {
            $lookup: {
              from: 'users', // Replace 'users' with the actual name of your users collection
              localField: 'createdBy',
              foreignField: '_id',
              as: 'userDetails',
            },
          },
          {
            $unwind: '$userDetails',
          },
          {
            $project: {
              name: '$userDetails.name',
              id: '$userDetails._id',
              email: '$userDetails.email',
              avatar: '$userDetails.profilePicture',
            },
          },
        ]).exec();
        const messages = await Chat.aggregate([
          {
            $match: {
              $expr: {
                $eq: [{ $size: "$participants" }, 2]
              }
            }
          },
          {
            $unwind: "$participants"
          },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "recruiterDetails"
            }
          },
          {
            $unwind: "$recruiterDetails"
          },
          {
            $group: {
              _id: "$_id",
              recruiterDetails: { $first: "$recruiterDetails" },
              messages: { $first: "$messages" }
            }
          },
          {
            $project: {
              unreadCount: {
                $size: {
                  $filter: {
                    input: "$messages",
                    as: "message",
                    cond: { $eq: ["$$message.readby", false] }
                  }
                }
              }
            }
          }
        ]).exec();
        if (messages.length > 0) {
          messages[0].unreadCount = messages[0].unreadCount > 0 ? messages[0].unreadCount : 0;
          const combinedData =
            users.length > 0 && messages.length > 0
              ? {
                _id: messages[0]._id, // Chat/message id
                id: users[0].id,     // User id
                name: users[0].name,
                avatar: users[0].avatar,
                email: users[0].email,
                role: users[0].role,
                unreadCount: messages[0].unreadCount,
              }
              : {};

          return [combinedData];
        }
        return users;

      } else {

        // const users = await Chat.aggregate([
        //   {
        //     $match: {
        //       $expr: {
        //         $eq: [{ $size: "$participants" }, 2]
        //       }
        //     }
        //   },
        //   {
        //     $unwind: "$participants"
        //   },
        //   {
        //     $lookup: {
        //       from: "users",
        //       localField: "participants",
        //       foreignField: "_id",
        //       as: "recruiterDetails"
        //     }
        //   },
        //   {
        //     $unwind: "$recruiterDetails"
        //   },
        //   {
        //     $group: {
        //       _id: "$_id",
        //       recruiterDetails: { $first: "$recruiterDetails" },
        //       messages: { $first: "$messages" }
        //     }
        //   },
        //   {
        //     $project: {
        //       id: "$recruiterDetails._id",
        //       name: "$recruiterDetails.name",
        //       avatar: "$recruiterDetails.profilePicture",
        //       email: "$recruiterDetails.email",
        //       role: "$recruiterDetails.role",
        //       unreadCount: {
        //         $size: {
        //           $filter: {
        //             input: "$messages",
        //             as: "message",
        //             cond: { $eq: ["$$message.readby", false] }
        //           }
        //         }
        //       }
        //     }
        //   }
        // ]).exec();
        // const users = await Chat.aggregate([
        //   {
        //     $match: {
        //       participants: {
        //         $all: [{ $elemMatch: { $ne: userId } }]
        //       }
        //     }
        //   },
        //   {
        //     $unwind: {
        //       path: "$participants"
        //     }
        //   },
        //   {
        //     $match: {
        //       participants: {
        //         $ne: userId
        //       }
        //     }
        //   },
        //   {
        //     $lookup: {
        //       from: "users",
        //       localField: "participants",
        //       foreignField: "_id",
        //       as: "otherUser"
        //     }
        //   },
        //   {
        //     $group: {
        //       otherUser: {
        //         $arrayElemAt: ["$otherUser", 0]
        //       }
        //     }
        //   }
        // ]).exec();
        const users = await Chat.aggregate([
          {
            $match: {
              participants: { $in: [mongoose.Types.ObjectId(userId)] }
            }
          },
          {
            $unwind: "$participants"
          },
          {
            $match: {
              participants: { $ne: mongoose.Types.ObjectId(userId) } // Exclude the requesting user
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "other_user"
            }
          },
          {
            $unwind: "$other_user"
          },
          {
            $project: {
              id: "$other_user._id",
              avatar: "$other_user.profilePicture",
              name: "$other_user.name",
              email: "$other_user.email",
              // to get count of unread meassages
              // chat: { $first: "$$ROOT" }
            }
          }
        ]);
        return users
      }


    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Unable to fetch users.');
    }
  },

  // async sendMessage (params){
  //   try {
  //     const { senderId, recipientId, message } = params;
  //     const savedMessage = await ChatService.saveMessage(senderId, recipientId, message);
  //     res.status(201).json(savedMessage);
  //   } catch (error) {
  //     console.error('Error sending message:', error);
  //     res.status(500).json({ error: 'Unable to send message.' });
  //   }
  // }
};

module.exports = ChatService;
