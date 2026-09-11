/**
 * Master Router
 * Mounts all API modules, CMS endpoints, Admin, CRM, and Mobile App routes.
 */

const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");

// 1. Unified CMS & Website Dynamic Content Router (Single Clean Import)
const cmswebRoutes = require("./cmswebRoutes");
const bharatVerifyRoutes = require("./bharatVerifyRoutes");

// 2. Authentication, Administration, User, Driver & Ride Core Routers
const authRoutes = require("./authRoutes");
const subAdminAuthRoutes = require("./subAdminAuthRoutes");
const userRoutes = require("./userRoutes");
const driverRoutes = require("./driverRoutes");
const rideRoutes = require("./rideRoutes");
const carRoutes = require("./carRoutes");
const promoRoutes = require("./promoRoutes");
const iconRoutes = require("./iconRoutes");
const settingsRoutes = require("./settingsRoutes");
const dashboardRoutes = require("./dashboardRoutes");

// Operations & Support Module Routers (Tips, Cancel Reasons, FAQs)
const tipRoutes = require("./tipRoutes");
const cancelReasonRoutes = require("./cancelReasonRoutes");
const faqRoutes = require("./faqRoutes");

// 3. Mount Unified Public Website & CMS Content Routes at Root (/api/)
router.use("/", cmswebRoutes);
router.use("/", bharatVerifyRoutes);

// 4. Admin Profile & Verification Check
const authController = require("../controllers/authController");
router.get("/profile", verifyAdmin, authController.getAdminProfile);

// 5. Auth & Sub-Admin Accounts Management
router.use("/auth", authRoutes);
router.use("/subadmin-auth", subAdminAuthRoutes);
router.use("/subadmins", subAdminAuthRoutes);

// 6. Settings, App Icons, Promos & Vehicles Management
router.use("/settings", settingsRoutes);
router.use("/icons", iconRoutes);
router.use("/promos", promoRoutes);
router.use("/cars", carRoutes);

// 7. Operations & Support Modules (Mounted with both plural and singular aliases)
router.use("/tips", tipRoutes);
router.use("/tip", tipRoutes);
router.use("/cancel-reasons", cancelReasonRoutes);
router.use("/cancel-reason", cancelReasonRoutes);
router.use("/faqs", faqRoutes);
router.use("/faq", faqRoutes);

// Driver Mobile App Middleware & Controllers
const driverUpload = require("../middleware/driverUpload");
const verifyDriverToken = require("../middleware/verifyDriverToken");
const verifyUserToken = require("../middleware/verifyUserToken");
const driverController = require("../controllers/driverController");
const userController = require("../controllers/userController");
const carController = require("../controllers/carController");
const promoController = require("../controllers/promoController");
const rideController = require("../controllers/rideController");
const chatController = require("../controllers/chatController");
const callController = require("../controllers/callController");
const faqController = require("../controllers/faqController");
const emergencyController = require("../controllers/emergencyController");
const contactChannelController = require("../controllers/contactChannelController");
const inviteLinkController = require("../controllers/inviteLinkController");
const tipController = require("../controllers/tipController");
const iconController = require("../controllers/iconController");
const weatherController = require("../controllers/weatherController");

// 8. Admin & CRM Panel Management Modules (Mounted with prefix)
router.use("/users", userRoutes);
router.use("/drivers", driverRoutes);
router.use("/rides", rideRoutes);
router.use("/dashboard", dashboardRoutes);
router.get("/recharge-history", driverController.getAllRechargeHistory);

// 9. Mobile App Exact Root Routes (Mounted at root /api/)

// Driver Mobile Endpoints at root /api/
router.all("/driver-register", driverController.driverRegister);
router.all("/number-register-driver", driverController.numberRegisterDriver);
router.all("/driver-otp-verify", driverController.driverOtpVerifyLogin);
router.all("/driver-otp-verify-login", driverController.driverOtpVerifyLogin);
router.all("/number-verify-driver", driverController.numberVerifyDriver);
router.all("/driver-active-status", verifyDriverToken, driverController.driverActiveStatus);
router.all("/driver-online-offline", driverController.driverOnlineOffline);
router.all("/driver-lat-lng-update", verifyDriverToken, driverController.driverLatLngUpdate);
router.all("/driver-profile", verifyDriverToken, driverController.driverProfile);
router.all("/complete-profile-driver", driverUpload.any(), driverController.completeProfileDriver);
router.all("/get-profile-driver", driverController.getProfileDriver);
router.all("/edit-profile-driver", driverUpload.any(), driverController.editProfileDriver);
router.all("/get-driver-status", driverController.getDriverStatus);
router.all("/driver-wallet-history", verifyDriverToken, driverController.driverWalletHistory);
router.all("/driver-details", verifyDriverToken, driverUpload.any(), driverController.updateDriver);
router.all("/driver-vehicle-detail", driverUpload.any(), driverController.driverVehicleDetail);
router.all("/get-vehicle-details", driverController.getVehicleDetails);
router.all("/get-vehicle-type-detail", driverController.getVehicleTypeDetail);
router.all("/get-car-bookings-driver", driverController.getCarBookingsDriver);
router.all("/get-referal-commision", driverController.getReferralCommissionMobile);
router.all("/driver-accept-booking", driverController.driverAcceptBooking);
router.all("/driver-msg-send", chatController.driverSendMessage);
router.all("/driver-get-msg-list", chatController.driverGetMessageList);
router.all("/driver-start-call", callController.driverStartCall);
router.all("/notification-to-drivers-for-ride", driverController.getDriverRegistrationIdsForRide);
router.all("/driver-reject-booking", driverController.driverRejectBooking);
router.all("/driver-get-reject-booking-status", driverController.driverGetRejectBookingStatus);
router.all("/check-booking-otp", driverController.checkBookingOtp);
router.all("/complete-ride", driverController.completeRide);
router.all("/get-driver-completed-cancel-rides", driverController.getDriverCompletedCancelRides);
router.all("/driver-recharge-wallet", driverController.driverRechargeWallet);
router.all("/get-recharge-history", driverController.getDriverRechargeHistory);
router.all("/get-bank-list", driverController.getBankList);
router.all("/driver-save-account-details", driverController.driverSaveAccountDetails);
router.all("/get-driver-account-details", driverController.getDriverAccountDetails);
router.all("/driver-withdraw-request", driverController.driverWithdrawRequest);
router.all("/get-driver-payment-history", driverController.getDriverPaymentHistory);
router.all("/get-driver-earning", driverController.getDriverEarnings);
router.all("/update-driver-location", driverController.updateDriverLocation);
router.all("/logout-driver", driverController.logoutDriver);
router.all("/driver-logout", driverController.logoutDriver);
router.all("/check-token-driver", driverController.checkDriverToken);
router.all("/document-again-upload-and-verify", driverUpload.any(), driverController.documentAgainUploadAndVerify);
router.all("/get-document-verification-status", driverController.getDocumentVerificationStatus);
router.all("/get-driver-referal-code", driverController.getDriverReferralCode);
router.all("/get-referal-by-driver-list", driverController.getReferralByDriverList);
router.all("/driver-topup-alert", driverController.driverTopupAlert);
router.all("/test-login", driverController.driverTestLogin);
router.all("/delete-driver-account", driverController.deleteDriverAccount);
router.all("/driver-delete-account", driverController.driverAccountDeleted);

// User Mobile Endpoints at root /api/
router.all("/user-register", userController.userRegister);
router.all("/user-otp-verify", userController.userOtpVerifyLogin);
router.all("/user-otp-verify-login", userController.userOtpVerifyLogin);
const userUpload = require("../middleware/userUpload");
router.all("/user-complete-profile", verifyUserToken, userUpload.any(), userController.userCompleteProfile);
router.all("/get-profile", verifyUserToken, userController.getProfile);
router.all("/edit-profile", verifyUserToken, userUpload.any(), userController.editProfile);
router.all("/user-logout", userController.logoutUser);
router.all("/logout", userController.logoutUser);
router.all("/check-token-user", userController.checkUserToken);
router.all("/add-guardian", userController.addGuardian);
router.all("/see-guardian", userController.seeGuardian);
router.all("/delete-guardian", userController.deleteGuardian);
router.all("/see-guardian-status", userController.seeGuardianStatus);
router.all("/add-guardian-later", userController.addGuardianLater);
router.all("/get-state", userController.getStates);
router.all("/test-login-user", userController.userTestLogin);
router.all("/user-app-work-or-not", userController.userAppWorkOrNot);
router.all("/delete-user-account", userController.deleteUserAccount);
router.all("/user-delete-account", userController.userAccountDeleted);
router.all("/user-recharge-wallet", verifyUserToken, userController.userRechargeWallet);
router.all("/get-transactions-list", verifyUserToken, userController.getTransactionsList);
router.all("/get-address-list", verifyUserToken, userController.getAddressList);
router.all("/send-user-location", verifyUserToken, userController.sendUserLocation);
router.all("/get-user-location", verifyUserToken, userController.getUserLocation);
router.all("/user-save-location", verifyUserToken, userController.userSaveLocation);
router.all("/edit-save-location", verifyUserToken, userController.editSaveLocation);
router.all("/get-save-location", verifyUserToken, userController.getSaveLocations);
router.all("/check-coupon-number", userController.checkCouponNumber);
router.all("/user-use-coupon", userController.userUseCoupon);
router.all("/car-booking", userController.carBooking);
router.all("/razorPay-user-details", userController.razorPayUserDetails);
router.all("/book-user-ride", userController.bookRide);
router.all("/get-cancel-complete-bookings", userController.getCancelCompleteBookings);
router.all("/user-msg-send", chatController.userSendMessage);
router.all("/user-get-msg-list", chatController.userGetMessageList);
router.all("/user-get-msg", chatController.userGetMessages);
router.all("/user-start-call", callController.userStartCall);
router.all("/user-get-call-list", callController.userGetCallList);
router.all("/accept-booking-driver-detail", userController.acceptBookingDriverDetail);
router.all("/user-wallet-recharges-list", userController.userWalletRechargesList);
router.all("/user-mood-emoji-get", userController.userMoodEmojiGet);
router.all("/driver-get-full-details", userController.driverGetFullDetails);
router.all("/get-cancel-reason", userController.getCancelReasons);
router.all("/get-accept-status-to-user", userController.getAcceptStatusToUser);
router.all("/user-reject-booking", userController.userRejectBooking);
router.all("/user-get-reject-booking-status", userController.userGetRejectBookingStatus);
router.all("/get-FAQ-list", faqController.getFaqList);
router.all("/get-emergency-number", emergencyController.getEmergencyNumbersMobile);
router.all("/get-contact-us", contactChannelController.getContactUsMobile);
router.all("/save-app-invite-link", inviteLinkController.saveAppInviteLink);
router.all("/get-app-invite-link", inviteLinkController.getAppInviteLink);
router.all("/get-cancle-reason", userController.getCancleReasonsMobile);
router.all("/rate-driver", userController.rateDriver);
router.all("/get-tips", tipController.getTipsMobile);
router.all("/add-tip-to-driver", userController.addTipToDriver);
router.all("/send-otp-to-update-number", userController.sendOtpToUpdateNumber);
router.all("/verify-otp-to-update-number", userController.verifyOtpToUpdateNumber);
router.all("/get-icons", iconController.getIconsMobile);
router.all("/get-driver-location", userController.getDriverLocation);
router.all("/use-promo-code", rideController.usePromoCode);
router.all("/get-promo-detail", promoController.getPromoDetail);
router.all("/weather-forcast-api", weatherController.getWeatherForecast);
router.all("/vehice-details", carController.getVehicleFaresDetails);
router.all("/vehicle-details", carController.getVehicleFaresDetails);
router.all("/get-kilometer-price", carController.getKilometerPrices);

// App Static Content & Policy Endpoints
const { getPrivacyPolicyMobile } = require("../controllers/privacyPolicyController");
const { getTermsConditionsMobile } = require("../controllers/termsConditionController");
const { getAboutUsMobile } = require("../controllers/aboutUsClauseController");
router.all("/get-privacy-policy", getPrivacyPolicyMobile);
router.all("/get-terms-conditions", getTermsConditionsMobile);
router.all("/get-about-Us", getAboutUsMobile);

// Ride Engine Mobile Endpoints at root /api/
router.use("/", rideRoutes);

// Notification Test Endpoint (Equivalent to PHP: ApiController::testNotification)
const { testNotification } = require("../services/fcmService");
router.all("/test-notification", testNotification);
router.all("/testNotification", testNotification);

module.exports = router;
