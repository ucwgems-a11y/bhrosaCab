const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");

const verifyDriverToken = async (req, res, next) => {
  try {
    let token = req.headers["token"] || req.headers["x-access-token"];

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Token not provided",
      });
    }

    // Try finding driver by direct token string (legacy PHP token or direct match)
    let driver = await Driver.findOne({ token: token });

    if (!driver) {
      // Try verifying as JWT
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "bhrosacab_secret_key_2026_8409586058"
        );
        if (decoded) {
          const orConditions = [];
          if (decoded.id) orConditions.push({ _id: decoded.id });
          if (decoded.number) orConditions.push({ number: decoded.number });
          if (decoded.phone) orConditions.push({ number: decoded.phone });

          if (orConditions.length > 0) {
            driver = await Driver.findOne({ $or: orConditions });
          }
        }
      } catch (jwtErr) {
        // JWT expired or invalid
      }
    }

    if (!driver) {
      return res.status(404).json({
        status: false,
        message: "Invalid driver token",
      });
    }

    if (driver.block_status === 1) {
      return res.status(403).json({
        status: false,
        message: "Your driver account has been blocked. Please contact admin.",
      });
    }

    req.driver = driver;
    next();
  } catch (error) {
    console.error("verifyDriverToken Error:", error);
    return res.status(500).json({
      status: false,
      message: "Authentication Error",
      details: error.message,
    });
  }
};

module.exports = verifyDriverToken;
