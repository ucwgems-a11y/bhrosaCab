const multer = require("multer");
const path = require("path");
const fs = require("fs");

const os = require("os");

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const bannerDir = isServerless
  ? path.join(os.tmpdir(), "uploads/banners")
  : path.join(__dirname, "../../uploads/banners");

try {
  if (!fs.existsSync(bannerDir)) {
    fs.mkdirSync(bannerDir, { recursive: true });
  }
} catch (e) {
  // Gracefully ignore on read-only file systems
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const bannerUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // max 15MB
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

module.exports = bannerUpload;
