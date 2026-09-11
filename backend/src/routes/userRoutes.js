const express = require("express");
const router = express.Router();
const userUpload = require("../middleware/userUpload");
const verifyUserToken = require("../middleware/verifyUserToken");
const {
  userSendMessage,
  userGetMessageList,
  userGetMessages,
} = require("../controllers/chatController");
const {
  userStartCall,
  userGetCallList,
} = require("../controllers/callController");
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
  checkCouponNumber,
  userUseCoupon,
  carBooking,
  razorPayUserDetails,
  bookRide,
  getCancelCompleteBookings,
  acceptBookingDriverDetail,
  userWalletRechargesList,
  userMoodEmojiGet,
  driverGetFullDetails,
  getCancelReasons,
  getAcceptStatusToUser,
  userRejectBooking,
  userGetRejectBookingStatus,
  getCancleReasonsMobile,
  rateDriver,
  addTipToDriver,
  sendOtpToUpdateNumber,
  verifyOtpToUpdateNumber,
  getDriverLocation,
  checkUserToken,
  addGuardian,
  seeGuardian,
  deleteGuardian,
  seeGuardianStatus,
  addGuardianLater,
  getStates,
  userTestLogin,
  userAppWorkOrNot,
  deleteUserAccount,
  userAccountDeleted,
} = require("../controllers/userController");
const { getFaqList } = require("../controllers/faqController");
const { getEmergencyNumbersMobile } = require("../controllers/emergencyController");
const { getContactUsMobile } = require("../controllers/contactChannelController");
const { saveAppInviteLink, getAppInviteLink } = require("../controllers/inviteLinkController");
const { getTipsMobile } = require("../controllers/tipController");
const { getIconsMobile } = require("../controllers/iconController");

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
router.all("/check-coupon-number", checkCouponNumber);
router.all("/user-use-coupon", userUseCoupon);
router.all("/car-booking", carBooking);
router.all("/razorPay-user-details", razorPayUserDetails);
router.all("/book-user-ride", bookRide);
router.all("/get-cancel-complete-bookings", getCancelCompleteBookings);
router.all("/user-msg-send", userSendMessage);
router.all("/user-get-msg-list", userGetMessageList);
router.all("/user-get-msg", userGetMessages);
router.all("/user-start-call", userStartCall);
router.all("/user-get-call-list", userGetCallList);
router.all("/accept-booking-driver-detail", acceptBookingDriverDetail);
router.all("/user-wallet-recharges-list", userWalletRechargesList);
router.all("/user-mood-emoji-get", userMoodEmojiGet);
router.all("/driver-get-full-details", driverGetFullDetails);
router.all("/get-cancel-reason", getCancelReasons);
router.all("/get-accept-status-to-user", getAcceptStatusToUser);
router.all("/user-reject-booking", userRejectBooking);
router.all("/user-get-reject-booking-status", userGetRejectBookingStatus);
router.all("/get-FAQ-list", getFaqList);
router.all("/get-emergency-number", getEmergencyNumbersMobile);
router.all("/get-contact-us", getContactUsMobile);
router.all("/save-app-invite-link", saveAppInviteLink);
router.all("/get-app-invite-link", getAppInviteLink);
router.all("/get-cancle-reason", getCancleReasonsMobile);
router.all("/rate-driver", rateDriver);
router.all("/get-tips", getTipsMobile);
router.all("/add-tip-to-driver", addTipToDriver);
router.all("/send-otp-to-update-number", sendOtpToUpdateNumber);
router.all("/verify-otp-to-update-number", verifyOtpToUpdateNumber);
router.all("/get-icons", getIconsMobile);
router.all("/get-driver-location", getDriverLocation);
router.all("/check-token-user", checkUserToken);
router.all("/add-guardian", addGuardian);
router.all("/see-guardian", seeGuardian);
router.all("/delete-guardian", deleteGuardian);
router.all("/see-guardian-status", seeGuardianStatus);
router.all("/add-guardian-later", addGuardianLater);
router.all("/get-state", getStates);
router.all("/test-login-user", userTestLogin);
router.all("/user-app-work-or-not", userAppWorkOrNot);
router.all("/delete-user-account", deleteUserAccount);

router.all("/user-delete-account", userAccountDeleted);

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
