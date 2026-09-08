const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyUserToken = async (req, res, next) => {
  try {
    let token = req.headers["token"] || req.headers["x-access-token"];

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    // Try finding user by token string directly (handles both PHP tokens and JWT)
    let user = await User.findOne({ appToken: token });

    if (!user) {
      // Try verifying as JWT
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "bhrosacab_secret_key_2026_8409586058"
        );
        if (decoded) {
          const orConditions = [];
          if (decoded.id) orConditions.push({ _id: decoded.id });
          if (decoded.mysqlId) orConditions.push({ mysqlId: decoded.mysqlId });
          if (decoded.phone) orConditions.push({ phone: decoded.phone });

          if (orConditions.length > 0) {
            user = await User.findOne({ $or: orConditions });
          }
        }
      } catch (jwtErr) {
        // JWT expired or invalid
      }
    }

    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact customer support.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("verifyUserToken Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

module.exports = verifyUserToken;
