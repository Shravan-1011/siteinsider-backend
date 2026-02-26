const axios = require("axios");

const checkWebsite = async (monitor) => {
  const {
    url,
    method = "GET",
    expectedStatus = 200,
    expectedKeyword,
  } = monitor;

  const start = Date.now();

  try {
    const response = await axios({
      method,
      url,
      timeout: 5000,
      validateStatus: () => true,
    });

    const responseTime = Date.now() - start;

    // 🔴 If HTTP status is not expected → DOWN
    if (response.status !== expectedStatus) {
      return {
        status: "DOWN",
        responseTime,
        statusCode: response.status,
        reason: `HTTP ${response.status}`,
      };
    }

    // 🔴 If keyword validation fails
    if (expectedKeyword && response.data) {
      const body =
        typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data);

      if (!body.includes(expectedKeyword)) {
        return {
          status: "DOWN",
          responseTime,
          statusCode: response.status,
          reason: "Expected keyword not found",
        };
      }
    }

    // 🟢 Everything OK
    return {
      status: "UP",
      responseTime,
      statusCode: response.status,
      reason: null,
    };

  } catch (error) {
    const responseTime = Date.now() - start;

    let reason = "Unknown error";
    let statusCode = null;

    if (error.response) {
      statusCode = error.response.status;
      reason = `HTTP ${error.response.status}`;
    } else if (error.code === "ECONNABORTED") {
      reason = "Timeout";
    } else if (error.code === "ENOTFOUND") {
      reason = "DNS lookup failed";
    } else if (error.code === "ECONNREFUSED") {
      reason = "Connection refused";
    } else if (error.code === "ECONNRESET") {
      reason = "Connection reset";
    } else if (error.code?.includes("TLS")) {
      reason = "SSL/TLS error";
    }

    return {
      status: "DOWN",
      responseTime,
      statusCode,
      reason,
    };
  }
};

module.exports = checkWebsite;