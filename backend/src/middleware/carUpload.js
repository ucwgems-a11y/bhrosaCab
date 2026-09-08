const multer = require("multer");
const path = require("path");
const fs = require("fs");

const carUploadDir = path.join(__dirname, "../../uploads/carandfare");
if (!fs.existsSync(carUploadDir)) {
  fs.mkdirSync(carUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, carUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const carUpload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // max 15MB
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

module.exports = carUpload;
