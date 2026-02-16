const express = require('express');
const cors = require('cors');

//Routepaths
const authRoutes =require('./routes/authRoutes');
const monitorRoutes = require("./routes/monitorRoutes");


const app=express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin || // allow server-to-server / Postman
      origin.includes("localhost") ||
      origin.includes("vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
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