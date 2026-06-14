let io;

const setIO = (ioInstance) => {
  io = ioInstance;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const connectedUsers = {};

const initializeSocket = (ioInstance) => {
  setIO(ioInstance);

  ioInstance.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("registerUser", (userId) => {
      connectedUsers[userId] = socket.id;
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`Socket ${socket.id} left room ${conversationId}`);
    });

    socket.on("sendMessage", (messageData) => {
      ioInstance.to(messageData.conversationId).emit("receiveMessage", messageData);
    });

    socket.on("disconnect", () => {
      console.log(`User Disconnected: ${socket.id}`);
      for (const userId in connectedUsers) {
        if (connectedUsers[userId] === socket.id) {
          delete connectedUsers[userId];
          break;
        }
      }
    });
  });
};

module.exports = { setIO, getIO, initializeSocket };