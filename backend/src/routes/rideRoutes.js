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
router.all("/get-available-drivers", verifyUserToken, getAvailableDrivers);

// In-City Booking Lifecycle
router.all("/user-book-ride", verifyUserToken, userBookRide);
router.all("/user-book-ride-arrived", verifyDriverToken, userBookRideArrived);
router.all("/user-ride-start", verifyDriverToken, userRideStart);
router.all("/user-ride-complete", verifyDriverToken, userRideComplete);

// Cancellations
router.all("/user-ride-cancel", verifyUserToken, userRideCancel);
router.all("/driver-ride-cancel", verifyDriverToken, driverRideCancel);

// Histories & Earnings
router.all("/driver-ride-history", verifyDriverToken, driverRideHistory);
router.all("/user-ride-history", verifyUserToken, userRideHistory);

// OutStation Rides Lifecycle
router.all("/user-book-outStation", verifyUserToken, userBookOutStation);
router.all("/driver-start-outStation", verifyDriverToken, driverStartOutStation);
router.all("/driver-otp-verify-outStation", verifyDriverToken, driverOtpVerifyOutStation);
router.all("/driver-complete-otp-outStation", verifyDriverToken, driverCompleteOtpOutStation);
router.all("/driver-complete-outStation", verifyDriverToken, driverCompleteOutStation);
router.all("/user-outstation-history", verifyUserToken, userOutstationHistory);
router.all("/driver-outstation-history", verifyDriverToken, driverOutstationHistory);

/* =========================================================================
   2. ADMIN & CRM PANEL MANAGEMENT ENDPOINTS
   ========================================================================= */

router.get("/rides/stats", getRideStats);
router.get("/rides", getRides);
router.get("/rides/:status", getRides);

module.exports = router;
