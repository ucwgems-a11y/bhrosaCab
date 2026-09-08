const express = require("express");
const router = express.Router();
const driverUpload = require("../middleware/driverUpload");
const verifyDriverToken = require("../middleware/verifyDriverToken");
const {
  // Mobile App Driver APIs
  driverRegister,
  driverOtpVerifyLogin,
  driverActiveStatus,
  driverLatLngUpdate,
  driverProfile,
  driverWalletHistory,

  // Admin & CRM APIs
  getDrivers,
  getDriverStats,
  getActiveDriversStateCount,
  getDriverById,
  updateDriverStatus,
  toggleBlockStatus,
  updateDriver,
  deleteDriver,
  getDriverWalletHistoryById,
  getAllRechargeHistory,
  getDriverRidesById,
  logoutDriver,
  getDriverReferrals,
  getDriverReferralCommissions,
  processMonthlyReferralPayout,
  rechargeDriverWallet,
} = require("../controllers/driverController");

/* =========================================================================
   1. MOBILE APP COMPATIBLE DRIVER ENDPOINTS
   ========================================================================= */
router.all("/driver-register", driverRegister);
router.all("/driver-otp-verify", driverOtpVerifyLogin);
router.all("/driver-otp-verify-login", driverOtpVerifyLogin);
router.all("/driver-active-status", verifyDriverToken, driverActiveStatus);
router.all("/driver-lat-lng-update", verifyDriverToken, driverLatLngUpdate);
router.all("/driver-profile", verifyDriverToken, driverProfile);
router.all("/profile", verifyDriverToken, driverProfile);
router.all("/driver-wallet-history", verifyDriverToken, driverWalletHistory);
router.all("/driver-wallet", verifyDriverToken, driverWalletHistory);
router.all("/driver-details", verifyDriverToken, driverUpload.any(), updateDriver);
router.all("/driver-logout", logoutDriver);
router.all("/logout", logoutDriver);

/* =========================================================================
   2. ADMIN & CRM PANEL DRIVER MANAGEMENT ENDPOINTS (Mounted at /drivers)
   ========================================================================= */
router.get("/stats", getDriverStats);
router.get("/active/state-count", getActiveDriversStateCount);
router.get("/active/by-state", getActiveDriversStateCount);
router.get("/wallet/recharge-history", getAllRechargeHistory);
router.get("/recharge-history", getAllRechargeHistory);

// Referral Commission Monthly Payout Engine
router.post("/referral-commission/process-payout", processMonthlyReferralPayout);
router.get("/referral-commission/process-payout", processMonthlyReferralPayout);

router.get("/", getDrivers);

// Single Driver Operations (by MongoDB _id)
router.get("/:id/referrals", getDriverReferrals);
router.get("/:id/referral-list", getDriverReferrals);
router.get("/:id/referral-commission", getDriverReferralCommissions);
router.get("/:id", getDriverById);
router.get("/:id/profile", getDriverById);
router.get("/:id/wallet-history", getDriverWalletHistoryById);
router.post("/:id/recharge", rechargeDriverWallet);
router.post("/:id/wallet/recharge", rechargeDriverWallet);
router.get("/:id/rides", getDriverRidesById);
router.post("/:id/logout", logoutDriver);
router.patch("/:id/logout", logoutDriver);
router.put("/:id/status", updateDriverStatus);
router.patch("/:id/status", updateDriverStatus);
router.put("/:id/block", toggleBlockStatus);
router.put("/:id", driverUpload.any(), updateDriver);
router.delete("/:id", deleteDriver);

module.exports = router;
