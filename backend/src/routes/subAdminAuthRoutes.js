const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getSubAdmins,
  getSubAdminById,
  registerSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  toggleSubAdminStatus,
  loginSubAdmin,
  changeSubAdminPassword,
  getSubAdminProfile,
  updateSubAdminProfileImage,
  requestWithdrawal,
  getWithdrawalRequests,
  updateWithdrawalStatus,
} = require("../controllers/subAdminAuthController");

// Sub-Admin Withdrawal Endpoints
router.post("/withdrawal-request", verifyAdmin, requestWithdrawal);
router.get("/withdrawal-requests", verifyAdmin, getWithdrawalRequests);
router.put("/withdrawal-request/:id/status", verifyAdmin, updateWithdrawalStatus);
router.patch("/withdrawal-request/:id/status", verifyAdmin, updateWithdrawalStatus);

// Sub-Admin Profile Endpoints
router.get("/profile", verifyAdmin, getSubAdminProfile);
router.get("/me", verifyAdmin, getSubAdminProfile);
router.put("/profile-image", verifyAdmin, upload.any(), updateSubAdminProfileImage);
router.put("/profile-image/:id", verifyAdmin, upload.any(), updateSubAdminProfileImage);
router.post("/update-profile-image", verifyAdmin, upload.any(), updateSubAdminProfileImage);

// Sub-Admin Management Endpoints
router.get("/", verifyAdmin, getSubAdmins);
router.get("/:id", verifyAdmin, getSubAdminById);
router.post("/", verifyAdmin, upload.any(), registerSubAdmin);
router.post("/register", verifyAdmin, upload.any(), registerSubAdmin);
router.post("/post-crm-sub-amdin", verifyAdmin, upload.any(), registerSubAdmin);
router.put("/:id", verifyAdmin, upload.any(), updateSubAdmin);
router.delete("/:id", verifyAdmin, deleteSubAdmin);
router.patch("/:id/toggle-status", verifyAdmin, toggleSubAdminStatus);

// Sub-Admin Auth Endpoints
router.post("/login", loginSubAdmin);
router.post("/subAdmin-login-post", loginSubAdmin);
router.post("/change-password", verifyAdmin, changeSubAdminPassword);
router.post("/crm-change-pass-post", verifyAdmin, changeSubAdminPassword);

module.exports = router;
