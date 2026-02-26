const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Monitor = require("../models/Monitor");

router.get("/:publicId", async (req, res) => {
  try {
    // 1️⃣ Find user by publicId
    const user = await User.findOne({ publicId: req.params.publicId });

    if (!user) {
      return res.status(404).json({ message: "Status page not found" });
    }

    // 2️⃣ Get monitors for that user
    const monitors = await Monitor.find({ user: user._id })
      .select("name url status updatedAt"); 
      // 👆 only send safe fields

    // 3️⃣ Send response
    res.json({
      projectName: user.name,
      monitors
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;