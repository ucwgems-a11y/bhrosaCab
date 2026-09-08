const express = require("express");
const router = express.Router();
const {
  // registerAdmin, // Disabled in production
  loginAdmin,
  getAdminProfile,
  changePassword,
  updateProfile,
} = require("../controllers/authController");
const verifyAdmin = require("../middleware/verifyAdmin");
const upload = require("../middleware/upload");

// router.post("/register", registerAdmin); // Disabled in production
router.post("/login", loginAdmin);
router.get("/profile", verifyAdmin, getAdminProfile);
router.post("/change-password", verifyAdmin, changePassword);
router.put("/profile", verifyAdmin, upload.any(), updateProfile);

module.exports = router;