const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
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
router.post("/withdrawal-request", requestWithdrawal);
router.get("/withdrawal-requests", getWithdrawalRequests);
router.put("/withdrawal-request/:id/status", updateWithdrawalStatus);
router.patch("/withdrawal-request/:id/status", updateWithdrawalStatus);

// Sub-Admin Profile Endpoints
router.get("/profile", getSubAdminProfile);
router.get("/me", getSubAdminProfile);
router.put("/profile-image", upload.any(), updateSubAdminProfileImage);
router.put("/profile-image/:id", upload.any(), updateSubAdminProfileImage);
router.post("/update-profile-image", upload.any(), updateSubAdminProfileImage);

// Sub-Admin Management Endpoints
router.get("/", getSubAdmins);
router.get("/:id", getSubAdminById);
router.post("/", upload.any(), registerSubAdmin);
router.post("/register", upload.any(), registerSubAdmin);
router.post("/post-crm-sub-amdin", upload.any(), registerSubAdmin);
router.put("/:id", upload.any(), updateSubAdmin);
router.delete("/:id", deleteSubAdmin);
router.patch("/:id/toggle-status", toggleSubAdminStatus);

// Sub-Admin Auth Endpoints
router.post("/login", loginSubAdmin);
router.post("/subAdmin-login-post", loginSubAdmin);
router.post("/change-password", changeSubAdminPassword);
router.post("/crm-change-pass-post", changeSubAdminPassword);

module.exports = router;
