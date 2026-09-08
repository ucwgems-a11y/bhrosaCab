/**
 * =========================================================================
 * DRIVER UPLOAD MIDDLEWARE (Multer)
 * Handles uploading driver profile pictures, vehicle images, licence,
 * insurance, RC, and Aadhaar document assets into 'uploads/drivers/'.
 * =========================================================================
 */
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const os = require("os");

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const driverDir = isServerless
  ? path.join(os.tmpdir(), "uploads/drivers")
  : path.join(__dirname, "../../uploads/drivers");

try {
  if (!fs.existsSync(driverDir)) {
    fs.mkdirSync(driverDir, { recursive: true });
  }
} catch (e) {
  // Gracefully ignore on read-only file systems
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, driverDir);
  },
  filename: (req, file, cb) => {
    // Unique timestamped filename to prevent name collisions
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const driverUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max file size
  fileFilter: (req, file, cb) => {
    // Accept standard image and PDF files
    cb(null, true);
  },
});

module.exports = driverUpload;
