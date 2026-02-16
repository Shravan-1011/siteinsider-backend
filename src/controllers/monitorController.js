const Monitor = require('../models/Monitor');
const CheckLog = require('../models/checkLog');
const Incident = require('../models/Incident');


const dns = require("dns").promises;
const checkWebsite = require("../services/checkWebsite");



const normalizeUrl = (url) => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

exports.createMonitor = async (req, res) => {
  try {
    let { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        message: "Name and URL are required",
      });
    }

    // Normalize URL
    url = normalizeUrl(url);

    // 1️⃣ Syntactic validation
    if (!isValidUrl(url)) {
      return res.status(400).json({
        message: "Invalid URL format",
      });
    }

    const hostname = new URL(url).hostname;

    // 2️⃣ DNS Resolution
    try {
      await dns.lookup(hostname);
    } catch (err) {
      return res.status(400).json({
        message: "Domain does not exist",
      });
    }

    // 3️⃣ Initial Health Check
    const result = await checkWebsite(url);

    // 4️⃣ Save Monitor (ALWAYS)
    const monitor = await Monitor.create({
      user: req.userId,
      name,
      url,
      status: result.status,
      lastChecked: new Date(),
    });

    // 5️⃣ If site is DOWN → create incident immediately
   

    res.status(201).json({
      message: "Monitor created successfully",
      monitor,
    });

  } catch (error) {
    console.error("CREATE MONITOR ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


//get all monitors for user
exports.getMonitors =async (req, res) => {
try{
    const monitors =await Monitor.find({ user: req.userId });
    res.json(monitors);
}catch(error){
        console.error("GET MONITORS ERROR:", error);    
    res.status(500).json({ message: error.message });

}

};

//get monitor by id
exports.getMonitorById = async (req,res) => {
    try {
        const monitor = await Monitor.findOne({ 
            _id: req.params.id,
            user:req.userId
        });
        if(!monitor){
            return res.status(404).json({ message: "Monitor not found" });

        }
        res.json(monitor);
    }catch(error){
        console.error("GET MONITOR BY ID ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};

//update monitor and delete monitor can be added later
//get monitor logs by id
exports.getMonitorLogs = async (req,res) => {
    try{

         const monitor = await Monitor.findOne({
      _id: req.params.id,
      user: req.userId
    });
    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }

        const logs = await CheckLog.find({monitor:req.params.id})
        .sort({ checkedAt: -1 })
        .limit(20);
        res.json(logs);

    }
    catch(error){
        console.error("GET MONITOR LOGS ERROR:", error);
        res.status(500).json({ message: error.message });
    }   
};

//get monitor incidents 
exports.getMonitorIncidents =async(req,res) => {
    try{

         const monitor = await Monitor.findOne({
      _id: req.params.id,
      user: req.userId
    });
    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }

        const incidents =await Incident.find({monitor:req.params.id})
        .sort({ startedAt: -1 });
        res.json(incidents);

    }
    catch(error){
        console.error("GET MONITOR INCIDENTS ERROR:", error);
        res.status(500).json({ message: error.message });
    }   

};


exports.getMonitorAnalytics = async(req,res) => {
    try{
        const { cursor, limit = 50 } = req.query;

         const monitor = await Monitor.findOne({
        _id: req.params.id,
        user: req.userId
        });
        if (!monitor) {
        return res.status(404).json({ message: "Monitor not found" });
        }

        const totalChecksInDB = await CheckLog.countDocuments({
      monitor: req.params.id,
    });

        const query = { monitor: req.params.id };

        const { range } = req.query;

if (range && range !== "all") {
  const now = new Date();
  let pastDate;

  if (range === "24h") {
    pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }

  if (range === "7d") {
    pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (range === "30d") {
    pastDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  if (pastDate) {
    query.checkedAt = { $gte: pastDate };
  }
}


        if(cursor){
            query.checkedAt = { $lt: new Date(cursor)};

        }
        let logsQuery = CheckLog.find(query)
      .sort({ checkedAt: -1 });

    // Handle "all" case safely
    if (limit !== "all") {
      logsQuery = logsQuery.limit(Number(limit));
    }

    const logs = await logsQuery;

        const nextCursor =
        logs.length>0 ? logs[logs.length - 1].checkedAt: null;

        // Reverse so graph goes oldest → newest
    const orderedLogs = logs.reverse();


    const responseTimeGraph = orderedLogs.map(log => ({
      time: log.checkedAt,
      value: log.responseTime || 0
    }));

    const statusGraph = orderedLogs.map(log => ({
      time: log.checkedAt,
      value: log.status === "UP" ? 1 : 0
    }));

    // Uptime based only on selected range
    const totalChecksInRange = orderedLogs.length;
    const upChecks = orderedLogs.filter(
      (log) => log.status === "UP"
    ).length;

    const uptimePercentage =
      totalChecksInRange === 0
        ? 0
        : ((upChecks / totalChecksInRange) * 100).toFixed(2);

       res.json({
        totalChecks: totalChecksInDB,
      responseTimeGraph,
      statusGraph,
      uptimePercentage,
      nextCursor
    });

        }catch(error){
        console.error("GET MONITOR ANALYTICS ERROR:", error);
        res.status(500).json({ message: error.message });
};

}

exports.deleteMonitor = async(req,res) => {
    try{
        const monitor = await Monitor.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        if(!monitor){
            return res.status(404).json({ message: "Monitor not found" });
        }
        res.json({ message: "Monitor deleted successfully" });
    }catch(error){
        console.error("DELETE MONITOR ERROR:", error);
        res.status(500).json({ message: error.message });   
    }
};


exports.pauseMonitor = async(req,res) => {
    try{
        const monitor = await Monitor.findOneAndUpdate({
            _id: req.params.id,
            user: req.userId
        },
        {isActive: false},
        {new: true}
        );
        if(!monitor){
            return res.status(404).json({ message: "Monitor not found" });
        }
        res.json({ message: "Monitor paused successfully", monitor });
    }catch(error){
        console.error("PAUSE MONITOR ERROR:", error);
        res.status(500).json({ message: error.message });   
        }
    
};


exports.resumeMonitor = async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isActive: true },
      { new: true }
    );

    if (!monitor) {
      return res.status(404).json({ message: "Monitor not found" });
    }

    res.json({
      message: "Monitor resumed successfully",
      monitor
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to resume monitor" });
  }
};
