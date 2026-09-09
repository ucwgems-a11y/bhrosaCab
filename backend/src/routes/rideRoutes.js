const express = require("express");
const router = express.Router();
const verifyUserToken = require("../middleware/verifyUserToken");
const verifyDriverToken = require("../middleware/verifyDriverToken");
const {
  getVehicleTypes,
  getVehicleTypeFare,
  getAvailableDrivers,
  userBookRide,
  userBookRideArrived,
  userRideStart,
  userRideComplete,
  userRideCancel,
  driverRideCancel,
  driverRideHistory,
  userRideHistory,
  userBookOutStation,
  driverStartOutStation,
  driverOtpVerifyOutStation,
  driverCompleteOtpOutStation,
  driverCompleteOtpVerifyOutStation,
  driverCompleteOutStation,
  userOutstationHistory,
  driverOutstationHistory,
  getRides,
  getRideStats,
} = require("../controllers/rideController");

/* =========================================================================
   1. MOBILE APP ENDPOINTS (EXACT PHP COMPATIBLE URLS)
   ========================================================================= */

// Vehicle Types & Fare Estimates
router.all("/get-vehicle-types", getVehicleTypes);
router.all("/get-vehicle-type-fare", getVehicleTypeFare);
router.all("/get-available-drivers", getAvailableDrivers);

// In-City Booking Lifecycle
router.all("/user-book-ride", userBookRide);
router.all("/user-book-ride-arrived", userBookRideArrived);
router.all("/user-ride-start", userRideStart);
router.all("/user-ride-complete", userRideComplete);

// Cancellations
router.all("/user-ride-cancel", userRideCancel);
router.all("/driver-ride-cancel", driverRideCancel);

// Histories & Earnings
router.all("/driver-ride-history", driverRideHistory);
router.all("/user-ride-history", userRideHistory);

// OutStation Rides Lifecycle
router.all("/user-book-outStation", userBookOutStation);
router.all("/driver-start-outStation", driverStartOutStation);
router.all("/driver-otp-verify-outStation", driverOtpVerifyOutStation);
router.all("/driver-complete-otp-outStation", driverCompleteOtpOutStation);
router.all("/driver-complete-otp-verify-outStation", driverCompleteOtpVerifyOutStation);
router.all("/driver-complete-outStation", driverCompleteOutStation);
router.all("/user-outstation-history", verifyUserToken, userOutstationHistory);
router.all("/driver-outstation-history", verifyDriverToken, driverOutstationHistory);

/* =========================================================================
   2. ADMIN & CRM PANEL MANAGEMENT ENDPOINTS
   ========================================================================= */

router.get("/rides/stats", getRideStats);
router.get("/rides", getRides);
router.get("/rides/:status", getRides);

module.exports = router;
