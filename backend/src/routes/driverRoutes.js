const express = require("express");
const router = express.Router();
const driverUpload = require("../middleware/driverUpload");
const verifyDriverToken = require("../middleware/verifyDriverToken");
const {
  driverSendMessage,
  driverGetMessageList,
} = require("../controllers/chatController");
const { driverStartCall } = require("../controllers/callController");
const { testNotification } = require("../services/fcmService");
const {
  // Mobile App Driver APIs
  driverRegister,
  numberRegisterDriver,
  driverOtpVerifyLogin,
  numberVerifyDriver,
  driverActiveStatus,
  driverOnlineOffline,
  driverLatLngUpdate,
  driverProfile,
  completeProfileDriver,
  getProfileDriver,
  editProfileDriver,
  getDriverStatus,
  driverVehicleDetail,
  getVehicleDetails,
  getVehicleTypeDetail,
  getCarBookingsDriver,
  getReferralCommissionMobile,
  driverWalletHistory,
  driverAcceptBooking,
  getDriverRegistrationIdsForRide,
  driverRejectBooking,
  driverGetRejectBookingStatus,
  checkBookingOtp,
  completeRide,
  getDriverCompletedCancelRides,
  driverRechargeWallet,
  getDriverRechargeHistory,
  getBankList,
  driverSaveAccountDetails,
  getDriverAccountDetails,
  driverWithdrawRequest,
  getDriverPaymentHistory,
  getDriverEarnings,
  updateDriverLocation,
  checkDriverToken,
  documentAgainUploadAndVerify,
  getDocumentVerificationStatus,
  getDriverReferralCode,
  getReferralByDriverList,
  driverTopupAlert,
  driverTestLogin,
  deleteDriverAccount,
  driverAccountDeleted,

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
router.all("/number-register-driver", numberRegisterDriver);
router.all("/driver-otp-verify", driverOtpVerifyLogin);
router.all("/driver-otp-verify-login", driverOtpVerifyLogin);
router.all("/number-verify-driver", numberVerifyDriver);
router.all("/driver-active-status", verifyDriverToken, driverActiveStatus);
router.all("/driver-online-offline", driverOnlineOffline);
router.all("/driver-lat-lng-update", verifyDriverToken, driverLatLngUpdate);
router.all("/driver-profile", verifyDriverToken, driverProfile);
router.all("/profile", verifyDriverToken, driverProfile);
router.all("/complete-profile-driver", driverUpload.any(), completeProfileDriver);
router.all("/get-profile-driver", getProfileDriver);
router.all("/edit-profile-driver", driverUpload.any(), editProfileDriver);
router.all("/get-driver-status", getDriverStatus);
router.all("/driver-vehicle-detail", driverUpload.any(), driverVehicleDetail);
router.all("/get-vehicle-details", getVehicleDetails);
router.all("/get-vehicle-type-detail", getVehicleTypeDetail);
router.all("/get-car-bookings-driver", getCarBookingsDriver);
router.all("/get-referal-commision", getReferralCommissionMobile);
router.all("/driver-accept-booking", driverAcceptBooking);
router.all("/driver-msg-send", driverSendMessage);
router.all("/driver-get-msg-list", driverGetMessageList);
router.all("/driver-start-call", driverStartCall);
router.all("/notification-to-drivers-for-ride", getDriverRegistrationIdsForRide);
router.all("/driver-reject-booking", driverRejectBooking);
router.all("/driver-get-reject-booking-status", driverGetRejectBookingStatus);
router.all("/check-booking-otp", checkBookingOtp);
router.all("/complete-ride", completeRide);
router.all("/get-driver-completed-cancel-rides", getDriverCompletedCancelRides);
router.all("/driver-recharge-wallet", driverRechargeWallet);
router.all("/get-recharge-history", getDriverRechargeHistory);
router.all("/get-bank-list", getBankList);
router.all("/driver-save-account-details", driverSaveAccountDetails);
router.all("/get-driver-account-details", getDriverAccountDetails);
router.all("/driver-withdraw-request", driverWithdrawRequest);
router.all("/get-driver-payment-history", getDriverPaymentHistory);
router.all("/get-driver-earning", getDriverEarnings);
router.all("/update-driver-location", updateDriverLocation);
router.all("/check-token-driver", checkDriverToken);
router.all("/document-again-upload-and-verify", driverUpload.any(), documentAgainUploadAndVerify);
router.all("/get-document-verification-status", getDocumentVerificationStatus);
router.all("/get-driver-referal-code", getDriverReferralCode);
router.all("/get-referal-by-driver-list", getReferralByDriverList);
router.all("/driver-topup-alert", driverTopupAlert);
router.all("/test-login", driverTestLogin);
router.all("/delete-driver-account", deleteDriverAccount);
router.all("/driver-delete-account", driverAccountDeleted);
router.all("/testNotification", testNotification);
router.all("/driver-wallet-history", verifyDriverToken, driverWalletHistory);
router.all("/driver-wallet", verifyDriverToken, driverWalletHistory);
router.all("/driver-details", verifyDriverToken, driverUpload.any(), updateDriver);
router.all("/logout-driver", logoutDriver);
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
