const express = require('express');
const cors = require('cors');

//Routepaths
const authRoutes =require('./routes/authRoutes');
const monitorRoutes = require("./routes/monitorRoutes");


const app=express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend-domain.vercel.app"
    ],
    credentials: true
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/monitors", monitorRoutes);

app.get("/health", (req,res) => {
res.status(200).json({
    status: "OK",
    message: "SiteInsider backend running 🚀"


});
});

module.exports = app;