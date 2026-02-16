const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const startMonitorJob = require("./jobs/monitorJob");

const PORT = process.env.PORT || 5000;

// Connect DB first
connectDB();

require("./models/User");
require("./models/Monitor");
require("./models/checkLog");
require("./models/Incident");
startMonitorJob();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
