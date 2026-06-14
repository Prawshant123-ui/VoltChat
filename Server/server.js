require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { initializeSocket } = require("./sockets/chatSockets");
const authRoute = require("./routes/authRoutes");
const profileRoute = require("./routes/profileRoute");
const uploadRoutes = require("./routes/uploadRoute");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const io = new Server(server, {
  cors: {
    origin: "process.env.CLIENT_URL",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  },
});
initializeSocket(io);
app.use(express.json());       

app.get("/", (req, res) => res.send("API is working!!"));
app.use("/api/auth", authRoute);
app.use("/api/test", profileRoute);
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis().catch(err => console.error("Redis failed, continuing without it:", err));
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};
startServer();