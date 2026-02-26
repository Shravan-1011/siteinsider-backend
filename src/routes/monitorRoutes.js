const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
const monitorController = require('../controllers/monitorController');
const authMiddleware = require('../middleware/authMiddleware');
const CheckLog = require("../models/checkLog");
const { getMonitorDetail } = require("../controllers/monitorController");



router.get("/:id/regions/latest", authMiddleware, async (req, res) => {
  try {
    const logs = await CheckLog.aggregate([
      {
        $match: {
          monitor: new mongoose.Types.ObjectId(req.params.id),
        },
      },
      { $sort: { checkedAt: -1 } },
      {
        $group: {
          _id: "$region",
          status: { $first: "$status" },
          responseTime: { $first: "$responseTime" },
        },
      },
    ]);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching region latest logs:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/:id/logs/:region", authMiddleware, async (req, res) => {
  try {
    const logs = await CheckLog.find({
      monitor: req.params.id,
      region: req.params.region,
    })
      .sort({ checkedAt: -1 })
      .limit(50);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching region logs:", error);
    res.status(500).json({ message: "Server Error" });
  }
});






router.post('/', authMiddleware, monitorController.createMonitor);
router.get('/', authMiddleware, monitorController.getMonitors);
router.get("/with-regions", authMiddleware, monitorController.getMonitorsWithRegions);
router.get("/:id", authMiddleware, monitorController.getMonitorById);
router.get("/:id/logs",authMiddleware, monitorController.getMonitorLogs);
router.get("/:id/incidents", authMiddleware, monitorController.getMonitorIncidents);
router.get("/:id/analytics",authMiddleware,monitorController.getMonitorAnalytics);
router.delete("/:id", authMiddleware, monitorController.deleteMonitor);
router.patch("/:id/pause", authMiddleware, monitorController.pauseMonitor);
router.patch("/:id/resume", authMiddleware, monitorController.resumeMonitor);
router.get("/:id/detail", authMiddleware, getMonitorDetail);




module.exports = router;