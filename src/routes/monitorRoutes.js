const express = require('express');
const router = express.Router();
const monitorController = require('../controllers/monitorController');
const authMiddleware = require('../middleware/authMiddleware');
console.log("authMiddleware:", typeof authMiddleware);
console.log("createMonitor:", typeof monitorController.createMonitor);
console.log("getMonitors:", typeof monitorController.getMonitors);


router.post('/', authMiddleware, monitorController.createMonitor);
router.get('/', authMiddleware, monitorController.getMonitors);
router.get("/:id", authMiddleware, monitorController.getMonitorById);
router.get("/:id/logs",authMiddleware, monitorController.getMonitorLogs);
router.get("/:id/incidents", authMiddleware, monitorController.getMonitorIncidents);
router.get("/:id/analytics",authMiddleware,monitorController.getMonitorAnalytics);
router.delete("/:id", authMiddleware, monitorController.deleteMonitor);
router.patch("/:id/pause", authMiddleware, monitorController.pauseMonitor);
router.patch("/:id/resume", authMiddleware, monitorController.resumeMonitor);



module.exports = router;