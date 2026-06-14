const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
  searchUsers,
  unsendMessage
} = require("../controllers/chatController");


const router = express.Router();

router.get("/users/search", protect, searchUsers);              
router.post("/conversation", protect, createConversation);
router.get("/conversation", protect, getConversations);
router.post("/message", protect, sendMessage);
router.get("/message/:conversationId", protect, getMessages);
router.delete("/message/:messageId", protect, unsendMessage);

module.exports = router;