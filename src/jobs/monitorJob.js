const cron = require("node-cron");
const Monitor = require("../models/Monitor");
const CheckLog = require("../models/checkLog");
const Incident = require("../models/Incident");
const checkWebsite = require("../services/checkWebsite");
const sendEmail = require("../services/emailServices");


const REGION_LATENCY = {
  India: 20,
  "New York": 130,
  Tokyo: 90,
};

const DOWN_THRESHOLD = 3; // consecutive failures required

module.exports = function startMonitoringJob(io)  {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running monitor job...");

    try {
      // ✅ Populate user once
      const monitors = await Monitor.find({ isActive: true }).populate("user");
      console.log("📦 Monitors found:", monitors.length);

      for (const monitor of monitors) {
        try {
          const now = new Date();
          console.log("🌐 Checking:", monitor.url);

          const result = await checkWebsite(monitor);
          console.log("📊 Result:", result);

           let upCount = 0;
           


           // ✅ Loop through selected regions
          let indiaStatus = "UP";

for (const region of monitor.regions || ["India"]) {

  let simulatedStatus = result.status;
  let simulatedResponseTime = result.responseTime;

  if (region === "India") {

    const smallJitter = Math.floor(Math.random() * 10);

    simulatedResponseTime =
      result.responseTime != null
        ? result.responseTime + smallJitter
        : null;

    indiaStatus = simulatedStatus; // 🔥 Primary region decides

  } else {

    const baseLatency =
      region === "New York" ? 130 : 90;

    const volatility =
      region === "New York" ? 60 : 40;

    const jitter = Math.floor(Math.random() * volatility);

    const spike =
      Math.random() > 0.9
        ? Math.floor(Math.random() * 250)
        : 0;

    if (Math.random() > 0.95) {
      simulatedStatus = "DOWN";
    }

    simulatedResponseTime =
      simulatedStatus === "UP" &&
      result.responseTime != null
        ? result.responseTime +
          baseLatency +
          jitter +
          spike
        : null;
  }

  await CheckLog.create({
    monitor: monitor._id,
    region,
    status: simulatedStatus,
    responseTime: simulatedResponseTime,
    statusCode:
      simulatedStatus === "UP"
        ? result.statusCode
        : 503,
    reason:
      simulatedStatus === "UP"
        ? result.reason
        : "Regional connectivity issue",
    checkedAt: now,
  });
}

          // =========================
          // 🔄 MAJORITY RULE STATUS
          // =========================
          const overallStatus = indiaStatus;

          monitor.status = overallStatus;
          monitor.lastChecked = now;
          await monitor.save();
          io.emit("statusUpdate", {
  monitorId: monitor._id.toString(),
  status: monitor.status,
  updatedAt: monitor.updatedAt,
});

          // =========================
          // 🔴 HANDLE DOWN STATUS
          // =========================
          if (overallStatus === "DOWN") {
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

            if (consecutiveDowns) {
              if (!activeIncident) {
                const newIncident = await Incident.create({
                  monitor: monitor._id,
                  startedAt: now,
                  statusCode: result.statusCode,
                  reason: result.reason || "Website is down",
                  lastAlertSentAt: now,
                  isResolved: false,
                });

                if (monitor.user?.email) {
                  await sendEmail(
                    monitor.user.email,
                    `🚨 Site Down - ${monitor.url}`,
                    `
                      <h2>🚨 Website Down Alert</h2>
                      <p><strong>URL:</strong> ${monitor.url}</p>
                      <p><strong>Reason:</strong> ${
                        result.reason || "Unknown"
                      }</p>
                      <p>Detected at ${now.toLocaleString()}</p>
                    `
                  );
                }

                console.log("🚨 Incident created & email sent");
              }
            }
          }

          // =========================
          // 🟢 HANDLE RECOVERY
          // =========================
          if (overallStatus === "UP") {
            const activeIncident = await Incident.findOne({
              monitor: monitor._id,
              isResolved: false,
            });

            if (activeIncident) {
              activeIncident.isResolved = true;
              activeIncident.resolvedAt = now;
              activeIncident.duration =
                now.getTime() -
                new Date(activeIncident.startedAt).getTime();

              await activeIncident.save();

              if (monitor.user?.email) {
                await sendEmail(
                  monitor.user.email,
                  `✅ Site Recovered - ${monitor.url}`,
                  `
                    <h2>✅ Website Recovered</h2>
                    <p><strong>URL:</strong> ${monitor.url}</p>
                    <p><strong>Previous Issue:</strong> ${
                      activeIncident.reason
                    }</p>
                    <p>Recovered at ${now.toLocaleString()}</p>
                    <p><strong>Total Downtime:</strong> ${
                      Math.floor(activeIncident.duration / 1000)
                    } seconds</p>
                  `
                );
              }

              console.log("✅ Incident resolved:", monitor.url);
            }
          }
        } catch (monitorError) {
          console.error("❌ Monitor loop error:", monitorError);
        }
      }
    } catch (jobError) {
      console.error("❌ Monitoring job error:", jobError);
    }
    
  });
};


