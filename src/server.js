const dotenv = require("dotenv");
dotenv.config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const startMonitorJob = require("./jobs/monitorJob");

const statusRoutes = require("./routes/status");
app.use("/api/status", statusRoutes);

const PORT = process.env.PORT || 5000;

// Connect DB first
connectDB();

require("./models/User");
require("./models/Monitor");
require("./models/checkLog");
require("./models/Incident");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"] // later restrict to frontend domain
  }
});

// Make io accessible everywhere
app.set("io", io);

// Optional: Log connections
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});
startMonitorJob(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running with WebSocket on port ${PORT}`);
});
