const cron = require("node-cron");
const Monitor = require("../models/Monitor");
const CheckLog = require("../models/checkLog");
const checkWebsite = require("../services/checkWebsite");
const Incident = require("../models/Incident");
const sendEmail = require("../services/emailServices");
const User = require("../models/User");



const DOWN_THRESHOLD = 2;
const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes




const startMonitoringJob = () => {
  cron.schedule(" */1 * * * *", async () => {
    console.log("Running monitor job...");

    const monitors = await Monitor.find({ isActive: true });
    console.log("📦 Monitors found:", monitors.length);

    for (const monitor of monitors) {
      const user = await User.findById(monitor.user);

      const now = new Date();
      console.log("🌐 Checking:", monitor.url);
      const result = await checkWebsite(monitor.url);
      console.log("📊 Result:", result);

      const checkLog = new CheckLog({
        monitor: monitor._id,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        checkedAt: now,
      });
      await checkLog.save();

      await Monitor.findByIdAndUpdate(monitor._id, {
        lastChecked: now,
        status: result.status,
      });

if (result.status === "DOWN") {
  const recentChecks = await CheckLog.find({
    monitor: monitor._id,
  })
    .sort({ checkedAt: -1 })
    .limit(DOWN_THRESHOLD);

  const consecutiveDowns =
    recentChecks.length === DOWN_THRESHOLD &&
    recentChecks.every((log) => log.status === "DOWN");

  const activeIncident = await Incident.findOne({
    monitor: monitor._id,
    isResolved: false,
  });

  if (consecutiveDowns && !activeIncident) {

  const incident = await Incident.create({
    monitor: monitor._id,
    startedAt: now,
    statusCode: result.statusCode,
    reason: "Website is down",
    lastAlertSentAt: now,
  });

  const user = await User.findById(monitor.user);

  if (user && user.email) {
    await sendEmail(
      user.email,
      `🚨 Site Down - ${monitor.url}`,
      `
        <h2>🚨 Website Down Alert</h2>
        <p><strong>URL:</strong> ${monitor.url}</p>
        <p>Time: ${now.toLocaleString()}</p>
      `
    );
  }

  console.log("🚨 Incident created & email sent");
}
}

if (result.status === "UP") {
  const activeIncident = await Incident.findOne({
    monitor: monitor._id,
    isResolved: false,
  });

  if (activeIncident) {
    const user = await User.findById(monitor.user);

  const timeSinceLastAlert =
    now - new Date(activeIncident.lastAlertSentAt).getTime();

  if (timeSinceLastAlert > ALERT_COOLDOWN) {
    await sendEmail(
      user.email,
      `🚨 Still Down - ${monitor.url}`,
      `
        <h2>⚠️ Website Still Down</h2>
        <p><strong>URL:</strong> ${monitor.url}</p>
        <p>Still unreachable as of ${now.toLocaleString()}</p>
      `
    );

    activeIncident.lastAlertSentAt = now;
    await activeIncident.save();
  }
}


    console.log("✅ Incident resolved:", monitor.url);
  }
}
    }
  );};


module.exports = startMonitoringJob;
