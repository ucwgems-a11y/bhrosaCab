const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Ensure database connection for all incoming API requests (Serverless compatible)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message,
    });
  }
});

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    message: "Bhrosa Cab Backend Running"
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "Bhrosa Cab Backend Running"
  });
});

module.exports = app;