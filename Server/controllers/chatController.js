const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const { getIO } = require("../sockets/chatSockets");
const User = require("../models/userModel");

const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;

    const currentUserId = req.user.userId;

    const existingConversation = await Conversation.findOne({
      participants: {
        $all: [currentUserId, participantId],
      },
      isGroup: false,
    });

    if (existingConversation) {
      return res.status(200).json({
        success: true,
        conversation: existingConversation,
      });
    }

    const conversation = await Conversation.create({
      participants: [currentUserId, participantId],
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .populate("lastMessage")
      .sort({
        updatedAt: -1,
      });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, mediaUrl, mediaType } = req.body;

    const senderId = req.user.userId;

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      text,
      mediaUrl,
      mediaType,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const io = getIO();

    io.to(conversationId).emit("receiveMessage", message);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "name email")
      .sort({
        createdAt: 1,
      });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ success: true, users: [] });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
      _id: { $ne: req.user.userId },   
    }).select("_id name email");

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const unsendMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    
    if (message.sender.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await Message.findByIdAndDelete(messageId);

    
    const io = getIO();
    io.to(message.conversation.toString()).emit("messageUnsent", { messageId });

    
    const lastMessage = await Message.findOne({ conversation: message.conversation })
      .sort({ createdAt: -1 });
    await Conversation.findByIdAndUpdate(message.conversation, {
      lastMessage: lastMessage?._id || null,
    });

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
  searchUsers,
  unsendMessage
};
