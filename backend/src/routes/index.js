/**
 * =========================================================================
 * BHROSA CAB - CENTRAL ROUTER (backend/src/routes/index.js)
 * =========================================================================
 * Ye master router file hai jo backend ke sabhi modules, CMS website endpoints,
 * Admin APIs, CRM APIs aur Mobile App endpoints ko cleanly mount karti hai.
 * =========================================================================
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

// 8. Admin & CRM Panel Management Modules (Mounted with prefix)
router.use("/users", userRoutes);
router.use("/drivers", driverRoutes);
router.use("/rides", rideRoutes);
router.use("/dashboard", dashboardRoutes);
router.get("/recharge-history", driverController.getAllRechargeHistory);

// 9. Mobile App Exact Root Routes (Mounted at root /api/)

// Driver Mobile Endpoints at root /api/
router.all("/driver-register", driverController.driverRegister);
router.all("/driver-otp-verify", driverController.driverOtpVerifyLogin);
router.all("/driver-otp-verify-login", driverController.driverOtpVerifyLogin);
router.all("/driver-active-status", verifyDriverToken, driverController.driverActiveStatus);
router.all("/driver-lat-lng-update", verifyDriverToken, driverController.driverLatLngUpdate);
router.all("/driver-profile", verifyDriverToken, driverController.driverProfile);
router.all("/driver-wallet-history", verifyDriverToken, driverController.driverWalletHistory);
router.all("/driver-details", verifyDriverToken, driverUpload.any(), driverController.updateDriver);
router.all("/driver-logout", driverController.logoutDriver);

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

// Ride Engine Mobile Endpoints at root /api/
router.use("/", rideRoutes);

module.exports = router;
