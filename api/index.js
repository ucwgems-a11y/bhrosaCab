const app = require("../backend/src/app");
const connectDB = require("../backend/src/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Vercel Serverless Database Connection Error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
  return app(req, res);
};
