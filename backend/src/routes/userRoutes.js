const express = require("express");
const router = express.Router();
const userUpload = require("../middleware/userUpload");
const verifyUserToken = require("../middleware/verifyUserToken");
const {
  userRegister,
  userOtpVerifyLogin,
  userCompleteProfile,
  getProfile,
  editProfile,
  getAllUsers,
  getUserStats,
  getUserById,
  toggleBlockUser,
  getCampaigns,
  getMediaSourceUsers,
  logoutUser,
} = require("../controllers/userController");

/* =========================================================================
   1. MOBILE APP ENDPOINTS (PHP EXACT URLS)
   ========================================================================= */
router.all("/user-register", userRegister);
router.all("/register", userRegister);
router.all("/user-otp-verify", userOtpVerifyLogin);
router.all("/user-otp-verify-login", userOtpVerifyLogin);
router.all("/verify-otp", userOtpVerifyLogin);
router.all("/user-complete-profile", verifyUserToken, userUpload.any(), userCompleteProfile);
router.all("/get-profile", verifyUserToken, getProfile);
router.all("/edit-profile", verifyUserToken, userUpload.any(), editProfile);
router.all("/logout", logoutUser);

/* =========================================================================
   2. ADMIN & CRM PANEL USER MANAGEMENT ENDPOINTS (Mounted at /users)
   ========================================================================= */
router.get("/stats", getUserStats);
router.get("/campaigns", getCampaigns);
router.get("/campaigns/media-source/:source", getMediaSourceUsers);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/toggle-block", toggleBlockUser);
router.post("/:id/logout", logoutUser);
router.patch("/:id/logout", logoutUser);

module.exports = router;
