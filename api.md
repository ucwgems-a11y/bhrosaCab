# Bhrosa Cab - API Migration Tracker (`api.md`)
*Private Audit & Implementation Progress Tracker (Git-ignored)*

---

## 1. `generateAccessToken()`
- **PHP Method:** Private Helper `generateAccessToken()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/services/fcmService.js` -> `generateAccessToken()`
- **MERN Route:** Internal Service Method
- **Purpose:** Generates short-lived Google OAuth2 Bearer Access Token using Service Account credentials for Firebase Cloud Messaging (FCM HTTP v1).
- **Status:** ✅ Completed
- **Pending / Action Required:** None (Production caching and error handling implemented).

---

## 2. `sendNotification($deviceToken, $title, $body)`
- **PHP Method:** Private Helper `sendNotification($deviceToken, $title, $body)` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/services/fcmService.js` -> `sendNotification()`
- **MERN Route:** Internal Service Method
- **Purpose:** Dispatches push notifications to mobile devices (driver/user) via Firebase Cloud Messaging HTTP v1 API.
- **Status:** ✅ Completed (Logic implemented & verified)
- **Pending / Action Required:** Place `notificationSympa.json` service account file in `backend/` folder when live push testing on physical devices is needed.

---

## 3. `testNotification(Request $request)`
- **PHP Route & Method:** `testNotification(Request $request)` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/services/fcmService.js` -> `testNotification()`
- **MERN Route:** `ALL /api/test-notification` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Endpoint to trigger and test FCM push notifications with a given device token (`reg_id`).
- **Status:** ✅ Completed (Implemented, route connected & tested)
- **Pending / Action Required:** None.

---

## 4. `userRegister` (PHP: `Route::any('user-register', 'one')`)
- **PHP Route & Method:** `Route::any('user-register', 'one')` -> `one()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userRegister`
- **MERN Route:** `POST /api/user-register` & `POST /api/user/register` (Mounted in `backend/src/routes/index.js` & `backend/src/routes/userRoutes.js`)
- **Purpose:** Handles user OTP login / signup, generates unique welcome coupon for new users, sends OTP via SMS Gateway.
- **Status:** ✅ Completed (Welcome coupon generation, coupon schema, method check & SMS Gateway synced)
- **Pending / Action Required:** None.

---

## 5. `userOtpVerifyLogin` (PHP: `Route::any('user-otp-verify', 'two')`)
- **PHP Route & Method:** `Route::any('user-otp-verify', 'two')` -> `two()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userOtpVerifyLogin`
- **MERN Route:** `ALL /api/user-otp-verify` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Validates mobile number and OTP, generates JWT auth token, stores FCM device token (`reg_id`), tracks `RegistrationEvent` marketing campaign data, returns auth token and registration status.
- **Status:** ✅ Completed (Already fully implemented and matching PHP logic 100%)
- **Pending / Action Required:** None.

---

## 6. `loginTwo` (PHP: `Route::any('user-otp-verify-login', 'loginTwo')`)
- **PHP Route & Method:** `Route::any('user-otp-verify-login', 'loginTwo')` -> `loginTwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userOtpVerifyLogin`
- **MERN Route:** `ALL /api/user-otp-verify-login` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Identical route alias to verify user OTP and issue login auth token.
- **Status:** ✅ Completed (Mapped cleanly to unified `userOtpVerifyLogin` controller)
- **Pending / Action Required:** None.

---

## 7. `userCompleteProfile` (PHP: `Route::any('user-complete-profile', 'three')`)
- **PHP Route & Method:** `Route::any('user-complete-profile', 'three')` -> `three()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userCompleteProfile`
- **MERN Route:** `ALL /api/user-complete-profile` (Mounted in `backend/src/routes/index.js` with `verifyUserToken` & `userUpload.any()`)
- **Purpose:** Completes user profile registration with personal details (name, email, gender, dob, coordinates) and KYC Aadhaar photos/number.
- **Status:** ✅ Completed (Already fully implemented with `verifyUserToken` and `userUpload.any()`)
- **Pending / Action Required:** None.

---

## 8. `getProfile` (PHP: `Route::any('get-profile', 'four')`)
- **PHP Route & Method:** `Route::any('get-profile', 'four')` -> `four()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getProfile`
- **MERN Route:** `ALL /api/get-profile` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Retrieves complete profile details for the authenticated user (including formatted contact numbers, image URL, and location).
- **Status:** ✅ Completed (Already fully implemented with exact response keys and phone split logic)
- **Pending / Action Required:** None.

---

## 9. `editProfile` (PHP: `Route::any('edit-profile', 'five')`)
- **PHP Route & Method:** `Route::any('edit-profile', 'five')` -> `five()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `editProfile`
- **MERN Route:** `ALL /api/edit-profile` (Mounted in `backend/src/routes/index.js` with `verifyUserToken` & `userUpload.any()`)
- **Purpose:** Updates authenticated user profile details (name, email, dob, gender, and avatar image upload).
- **Status:** ✅ Completed (Already fully implemented with file/base64 uploads and exact response message)
- **Pending / Action Required:** None.

---

## 10. `logoutUser` (PHP: `Route::any('logout', 'six')`)
- **PHP Route & Method:** `Route::any('logout', 'six')` -> `six()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `logoutUser`
- **MERN Route:** `ALL /api/logout` & `ALL /api/user-logout` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Terminates user session, nullifies auth token and FCM token, sets user `isActive = false`.
- **Status:** ✅ Completed (Already fully implemented supporting both self-logout and admin force-logout)
- **Pending / Action Required:** None.

---

## 11. `userRechargeWallet` (PHP: `Route::any('user-recharge-wallet', 'seven')`)
- **PHP Route & Method:** `Route::any('user-recharge-wallet', 'seven')` -> `seven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userRechargeWallet`
- **MERN Route:** `ALL /api/user-recharge-wallet` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Adds money to user wallet, generates 10-char alphanumeric transaction ID, logs in `user_wallet_recharge` collection, and returns updated balance.
- **Status:** ✅ Completed (Created `UserWalletRecharge` model, controller, route, and verified)
- **Pending / Action Required:** None.

---

## 12. `getTransactionsList` (PHP: `Route::any('get-transactions-list', 'eight')`)
- **PHP Route & Method:** `Route::any('get-transactions-list', 'eight')` -> `eight()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getTransactionsList`
- **MERN Route:** `ALL /api/get-transactions-list` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Fetches user wallet transaction history with formatted date/time, category classification ('Taxi Expense' vs 'Money Added in Wallet'), driver/vehicle details for ride expenses, and formatted balance.
- **Status:** ✅ Completed (Implemented, route connected & tested)
- **Pending / Action Required:** None.

---

## 13. `getAddressList` (PHP: `Route::any('get-address-list', 'nine')`)
- **PHP Route & Method:** `Route::any('get-address-list', 'nine')` -> `nine()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getAddressList`
- **MERN Route:** `ALL /api/get-address-list` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Fetches all saved addresses for the authenticated user from `user_addresses` collection.
- **Status:** ✅ Completed (Created `UserAddress` model, controller, route, and verified)
- **Pending / Action Required:** None.

---

## 14. `sendUserLocation` (PHP: `Route::any('send-user-location', 'ten')`)
- **PHP Route & Method:** `Route::any('send-user-location', 'ten')` -> `ten()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `sendUserLocation`
- **MERN Route:** `ALL /api/send-user-location` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Stores user trip route coordinates (pickup & destination) in `send_locations` collection and updates active booking status.
- **Status:** ✅ Completed (Created `SendLocation` model, controller, route, and verified)
- **Pending / Action Required:** None.

---

## 15. `getUserLocation` (PHP: `Route::any('get-user-location', 'eleven')`)
- **PHP Route & Method:** `Route::any('get-user-location', 'eleven')` -> `eleven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getUserLocation`
- **MERN Route:** `ALL /api/get-user-location` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Fetches user's latest trip route coordinates and calculates Haversine distance in KM between pickup and destination.
- **Status:** ✅ Completed (Implemented, route connected & tested)
- **Pending / Action Required:** None.

---

## 16. `userSaveLocation` (PHP: `Route::any('user-save-location', 'twelve')`)
- **PHP Route & Method:** `Route::any('user-save-location', 'twelve')` -> `twelve()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userSaveLocation`
- **MERN Route:** `ALL /api/user-save-location` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Saves user's favorite custom location (e.g. Home, Office) with name and coordinates in `user_save_locations` collection.
- **Status:** ✅ Completed (Created `UserSaveLocation` model, controller, route, and verified)
- **Pending / Action Required:** None.

---

## 17. `editSaveLocation` (PHP: `Route::any('edit-save-location', 'edit_save_location')`)
- **PHP Route & Method:** `Route::any('edit-save-location', 'edit_save_location')` -> `edit_save_location()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `editSaveLocation`
- **MERN Route:** `ALL /api/edit-save-location` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Updates an existing saved favorite location by its ID in `user_save_locations` collection.
- **Status:** ✅ Completed (Implemented, route connected & tested)
- **Pending / Action Required:** None.

---

## 18. `getSaveLocations` (PHP: `Route::any('get-save-location', 'thirteen')`)
- **PHP Route & Method:** `Route::any('get-save-location', 'thirteen')` -> `thirteen()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getSaveLocations`
- **MERN Route:** `ALL /api/get-save-location` (Mounted in `backend/src/routes/index.js` with `verifyUserToken`)
- **Purpose:** Retrieves all saved favorite locations for the user from `user_save_locations` collection.
- **Status:** ✅ Completed (Implemented, route connected & tested)
- **Pending / Action Required:** None.

---

## 19. `getPrivacyPolicy` (PHP: `Route::any('get-privacy-policy', 'fourteen')`)
- **PHP Route & Method:** `Route::any('get-privacy-policy', 'fourteen')` -> `fourteen()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/privacyPolicyController.js` -> `getPrivacyPolicyMobile`
- **MERN Route:** `ALL /api/get-privacy-policy` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Retrieves complete privacy policy for the mobile app. Returns structured JSON with raw database `details` array, as well as a pure inner container HTML string (`html`) with 100% inline CSS styling (no html/body wrapping tags), designed to plug directly inside native App screen / Flutter `Html` widget / React Native `RenderHtml`.
- **Output:**
  - `GET /api/get-privacy-policy` -> JSON `{ success: true, message: "Data Retrieved Successfully", html: "<div class='bhrosa-legal-container' style='...'>...</div>", details: [...] }`
- **Status:** ✅ Completed (Pure inline styled inner body HTML)
- **Pending / Action Required:** None.

---

## 19b. `getTermsConditions` (PHP: `Route::any('get-terms-conditions', 'twentytwo')`)
- **PHP Route & Method:** `Route::any('get-terms-conditions', 'twentytwo')` -> `twentytwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/termsConditionController.js` -> `getTermsConditionsMobile`
- **MERN Route:** `ALL /api/get-terms-conditions` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Retrieves complete Terms & Conditions and Refund Policy for the mobile app. Returns structured JSON with raw database `details` array, as well as a pure inner container HTML string (`html`) with 100% inline CSS styling (no html/body wrapping tags), responsive vehicle pricing table (Bike ₹50, Auto ₹75, Hatchback ₹100, Sedan ₹125, SUV ₹150, Luxury ₹400), and refund rules designed to plug directly inside native App screen / Flutter `Html` widget / React Native `RenderHtml`.
- **Output:**
  - `GET /api/get-terms-conditions` -> JSON `{ success: true, message: "Terms Data Get Successfully", html: "<div class='bhrosa-legal-container' style='...'>...</div>", details: [...] }`
- **Status:** ✅ Completed (Pure inline styled inner body HTML)
- **Pending / Action Required:** None.

---

## 20. `getVehicleTypes` (PHP: `Route::any('get-vehicle-types', 'get_vehicle_types')`)
- **PHP Route & Method:** `Route::any('get-vehicle-types', 'get_vehicle_types')` -> `get_vehicle_types()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `getVehicleTypes`
- **MERN Route:** `ALL /api/get-vehicle-types` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Retrieves all vehicle price fares populated with vehicle types (`carType`), with strict GET method validation and exact PHP response mapping.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 21. `getVehicleTypeFare` (PHP: `Route::any('get-vehicle-type-fare', 'get_vehicle_type_fare')`)
- **PHP Route & Method:** `Route::any('get-vehicle-type-fare', 'get_vehicle_type_fare')` -> `get_vehicle_type_fare()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `getVehicleTypeFare`
- **MERN Route:** `ALL /api/get-vehicle-type-fare` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Calculates fare estimates for all vehicle types based on distance, supporting 2KM minimum fares by category ID (1: Bike Rs.30, 2: Auto Rs.40, Default: Rs.90), outstation rates, and randomized range pricing. Supports both MySQL ID and MongoDB ObjectId.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 22. `getAvailableDrivers` (PHP: `Route::any('get-available-drivers', 'get_available_drivers')`)
- **PHP Route & Method:** `Route::any('get-available-drivers', 'get_available_drivers')` -> `get_available_drivers()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `getAvailableDrivers`
- **MERN Route:** `ALL /api/get-available-drivers` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Fetches active, unblocked nearby drivers within a 20 KM radius using Haversine calculation, verifying driver wallet against required vehicle category topup (`driver_topup` / `DriverTopup`), with dummy driver avatar fallback and nearest-first sorting.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 23. `userBookRide` (PHP: `Route::any('user-book-ride', 'user_book_ride')`)
- **PHP Route & Method:** `Route::any('user-book-ride', 'user_book_ride')` -> `user_book_ride()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `userBookRide`
- **MERN Route:** `ALL /api/user-book-ride` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Creates a ride booking for an authenticated, verified user with 4-digit start OTP, comprehensive coordinate & fare validation, and DLT SMS gateway notification to passenger.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 24. `userBookRideArrived` (PHP: `Route::any('user-book-ride-arrived', 'user_book_ride_arrived')`)
- **PHP Route & Method:** `Route::any('user-book-ride-arrived', 'user_book_ride_arrived')` -> `user_book_ride_arrived()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `userBookRideArrived`
- **MERN Route:** `ALL /api/user-book-ride-arrived` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Updates ride status to 'arrived' upon driver confirmation at pickup location, validates driver token, updates start OTP, and records arrival timestamp.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 25. `userRideStart` (PHP: `Route::any('user-ride-start', 'user_ride_start')`)
- **PHP Route & Method:** `Route::any('user-ride-start', 'user_ride_start')` -> `user_ride_start()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `userRideStart`
- **MERN Route:** `ALL /api/user-ride-start` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Verifies start OTP entered by driver, transitions ride status to 'in_progress', updates waiting charges & final fare, generates 4-digit ride completion OTP, and dispatches DLT completion OTP SMS to passenger.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 26. `userRideComplete` (PHP: `Route::any('user-ride-complete', 'user_ride_complete')`)
- **PHP Route & Method:** `Route::any('user-ride-complete', 'user_ride_complete')` -> `user_ride_complete()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `userRideComplete`
- **MERN Route:** `ALL /api/user-ride-complete` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Validates completion OTP, marks ride as 'completed', clears OTP, and executes the 3-tier platform commission settlement (Extra charge, Above-distance surcharges, and Slabs) updating driver wallet and ledger in `driver_wallet_recharge`.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 27. `userRideCancel` (PHP: `Route::any('user-ride-cancel', 'user_ride_cancel')`)
- **PHP Route & Method:** `Route::any('user-ride-cancel', 'user_ride_cancel')` -> `user_ride_cancel()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `userRideCancel`
- **MERN Route:** `ALL /api/user-ride-cancel` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Cancels a booked ride on user request, sets ride status to 'cancelled' with custom reason and clears OTP, creates fine entry in `user_ride_cancels` (₹90), compensates assigned driver with +₹50 into their wallet and records ledger entry in `driver_wallet_recharge`.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 28. `driverRideHistory` (PHP: `Route::any('driver-ride-history', 'driver_ride_history')`)
- **PHP Route & Method:** `Route::any('driver-ride-history', 'driver_ride_history')` -> `driver_ride_history()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `driverRideHistory`
- **MERN Route:** `ALL /api/driver-ride-history` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Returns comprehensive driver ride history populated with passenger details, real-time driver earnings aggregation (today, this_week, this_month, this_year), cancellation tracking and recharge transaction details.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 29. `userRideHistory` (PHP: `Route::any('user-ride-history', 'user_ride_history')`)
- **PHP Route & Method:** `Route::any('user-ride-history', 'user_ride_history')` -> `user_ride_history()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `userRideHistory`
- **MERN Route:** `ALL /api/user-ride-history` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Returns all ride bookings of the authenticated user populated with driver details (`driver_name`, `driver_phone`, `driver_image`), user cancellation detection, cancellation message, and fine details (`cancel_fine`) from `user_ride_cancels`.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 30. `driverRideCancel` (PHP: `Route::any('driver-ride-cancel', 'driver_ride_cancel')`)
- **PHP Route & Method:** `Route::any('driver-ride-cancel', 'driver_ride_cancel')` -> `driver_ride_cancel()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `driverRideCancel`
- **MERN Route:** `ALL /api/driver-ride-cancel` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Cancels an assigned booked ride on driver request, updates status to 'cancelled' with custom reason and clears OTP, applies a ₹50 penalty debit to the driver's wallet, and records a negative transaction in `driver_wallet_recharge`.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 31. `userBookOutStation` (PHP: `Route::any('user-book-outStation', 'user_book_outStation')`)
- **PHP Route & Method:** `Route::any('user-book-outStation', 'user_book_outStation')` -> `user_book_outStation()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `userBookOutStation`
- **MERN Route:** `ALL /api/user-book-outStation` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Books an outstation ride for verified users (`register == 1`), generates a 4-digit start OTP, saves outstation-specific rates (`outStationADkm: 40`, `outStationADparcent: 12`, `booking_type: 'outStation'`), dispatches DLT OTP SMS via Vadvertiseweb gateway, and returns standard success response.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 32. `driverStartOutStation` (PHP: `Route::any('driver-start-outStation', 'driver_start_outStation')`)
- **PHP Route & Method:** `Route::any('driver-start-outStation', 'driver_start_outStation')` -> `driver_start_outStation()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `driverStartOutStation`
- **MERN Route:** `ALL /api/driver-start-outStation` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Initiates outstation ride by the driver, generates a new 4-digit ride start OTP, updates booking in database, dispatches DLT OTP SMS to customer mobile via Vadvertiseweb gateway (template `1707177755350501043`), and returns success response with generated OTP.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 33. `driverOtpVerifyOutStation` (PHP: `Route::any('driver-otp-verify-outStation', 'driver_otp_verify_outStation')`)
- **PHP Route & Method:** `Route::any('driver-otp-verify-outStation', 'driver_otp_verify_outStation')` -> `driver_otp_verify_outStation()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `driverOtpVerifyOutStation`
- **MERN Route:** `ALL /api/driver-otp-verify-outStation` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Verifies outstation ride start OTP provided by the passenger. Upon match, updates booking status to `'in_progress'`, clears OTP (`otp = null`), and returns standard success response (`"Outstation ride started successfully"`).
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 34. `driverCompleteOtpOutStation` (PHP: `Route::any('driver-complete-otp-outStation', 'driver_complete_otp_outStation')`)
- **PHP Route & Method:** `Route::any('driver-complete-otp-outStation', 'driver_complete_otp_outStation')` -> `driver_complete_otp_outStation()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `driverCompleteOtpOutStation`
- **MERN Route:** `ALL /api/driver-complete-otp-outStation` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Requests completion OTP generation for an outstation ride. Generates a new 4-digit completion OTP, saves it into the booking record, dispatches DLT completion SMS to customer mobile via Vadvertiseweb gateway (template `1707177755350501043`), and returns success response with generated OTP.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 35. `driverCompleteOtpVerifyOutStation` (PHP: `Route::any('driver-complete-otp-verify-outStation', 'driver_complete_otp_verify_outStation')`)
- **PHP Route & Method:** `Route::any('driver-complete-otp-verify-outStation', 'driver_complete_otp_verify_outStation')` -> `driver_complete_otp_verify_outStation()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `driverCompleteOtpVerifyOutStation` (aliased to `driverCompleteOutStation`)
- **MERN Route:** `ALL /api/driver-complete-otp-verify-outStation` & `ALL /api/driver-complete-outStation` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Verifies outstation ride completion OTP provided by the passenger. Upon match, marks the booking as `'completed'`, clears the OTP (`otp = null`), and returns standard success response (`"Outstation ride completed successfully"`).
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 36. `driverActiveRide` (PHP: `Route::any('driver-active-ride', 'driver_active_ride')`)
- **PHP Route & Method:** `Route::any('driver-active-ride', 'driver_active_ride')` -> `driver_active_ride()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `driverActiveRide`
- **MERN Route:** `ALL /api/driver-active-ride` (Mounted in `backend/src/routes/rideRoutes.js`)
- **Purpose:** Fetches the current active ride (`status IN ('in_progress', 'booked', 'arrived')`) for the authenticated driver. If no active ride is found, returns `200 {"message": "No booking found"}`. If found, returns `200` with driver location and ride details under `'ride_deltails'`.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 37. `checkCouponNumber` (PHP: `Route::any('check-coupon-number', 'checkCouponNumber')`)
- **PHP Route & Method:** `Route::any('check-coupon-number', 'checkCouponNumber')` -> `checkCouponNumber()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `checkCouponNumber`
- **MERN Route:** `ALL /api/check-coupon-number` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Verifies a passenger's welcome coupon code (`welcomeCoupon`). Validates `GET` method, checks if coupon exists in `users`, verifies whether it is already redeemed (`couponStatus == 1`), and returns coupon discount metadata (`couponAmount`, `couponStatus`, `userName`).
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 38. `userUseCoupon` (PHP: `Route::any('user-use-coupon', 'userUseCoupon')`)
- **PHP Route & Method:** `Route::any('user-use-coupon', 'userUseCoupon')` -> `userUseCoupon()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userUseCoupon`
- **MERN Route:** `ALL /api/user-use-coupon` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Marks a passenger's welcome coupon (`welcomeCoupon`) as redeemed. Validates `GET` method, finds user by coupon, updates `couponStatus = 1` and `coupon_status = 1` in database, and returns updated coupon details with success message (`"Coupon found and used successfully"`).
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 39. `numberRegisterDriver` (PHP: `Route::any('number-register-driver', 'onehundredOne')`)
- **PHP Route & Method:** `Route::any('number-register-driver', 'onehundredOne')` -> `onehundredOne()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `numberRegisterDriver`
- **MERN Route:** `ALL /api/number-register-driver` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Registers or initiates login for a driver using mobile number. Validates `POST` method, checks referral code validity (if provided, must exist in `register_drivers` with `status == 2`), checks `block_status == 1`, generates 4-digit OTP, dispatches DLT OTP SMS via Vadvertiseweb gateway, and returns success response with gateway response.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 40. `numberVerifyDriver` (PHP: `Route::any('number-verify-driver', 'onehundredTwo')`)
- **PHP Route & Method:** `Route::any('number-verify-driver', 'onehundredTwo')` -> `onehundredTwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `numberVerifyDriver`
- **MERN Route:** `ALL /api/number-verify-driver` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Verifies driver login OTP. Validates `POST` method, checks required `number` and `otp` (`400 NUMBER_AND_OTP_REQ`), checks `block_status == 1` (`403`), returns `200 {"success": false, "message": "INVALID_OTP", "token": "0"}` on mismatch, and upon match generates authentication token and returns driver metadata (`token`, `driver_id`, `register`, `active_status`, `status`, `block_status`).
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 41. `completeProfileDriver` (PHP: `Route::any('complete-profile-driver', 'seventeen')`)
- **PHP Route & Method:** `Route::any('complete-profile-driver', 'seventeen')` -> `seventeen()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `completeProfileDriver`
- **MERN Route:** `ALL /api/complete-profile-driver` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Submits driver profile documents, vehicle specs, and personal info. Validates `POST` method (405 on non-POST), checks `token` header (400 if missing, 404 `"Invalid user token"` if invalid), processes multipart files via `driverUpload.any()`, automatically generates unique referral code, sets `register = 1` and `status = 1` (pending admin verification), and returns `200 {"message": "Updated Successfully", "referalCode": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 42. `getProfileDriver` (PHP: `Route::any('get-profile-driver', 'eighteen')`)
- **PHP Route & Method:** `Route::any('get-profile-driver', 'eighteen')` -> `eighteen()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getProfileDriver`
- **MERN Route:** `ALL /api/get-profile-driver` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves driver profile details. Validates `GET` method (405 on non-GET), checks `token` header (400 if missing, 404 `"Invalid driver token"` if invalid), prefixes full URL to all document and image assets, computes `country_code` and `number_without_country_code`, aggregates ratings from `driver_ratings`, attaches `fare_per_km` and `fare_per_km_to` from `PriceFare`, and returns exact PHP array wrapper `200 {"message": "Profile Get Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 43. `editProfileDriver` (PHP: `Route::any('edit-profile-driver', 'nineteen')`)
- **PHP Route & Method:** `Route::any('edit-profile-driver', 'nineteen')` -> `nineteen()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `editProfileDriver`
- **MERN Route:** `ALL /api/edit-profile-driver` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Updates driver basic profile fields (`name`, `last_name`, `number`, `image`). Validates `POST` method (405 on non-POST), checks `token` header (400 if missing, 404 `"Invalid user token"` if invalid), handles multipart image upload with old file cleanup, and returns exact PHP response `200 {"success": true, "message": "Driver profile updated successfully."}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 44. `logoutDriver` (PHP: `Route::any('logout-driver', 'twenty')`)
- **PHP Route & Method:** `Route::any('logout-driver', 'twenty')` -> `twenty()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `logoutDriver`
- **MERN Route:** `ALL /api/logout-driver` and `ALL /api/driver-logout` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Dual-mode driver logout handler. **Branch A** preserves Admin / Sub-Admin Force Logout via Web Panel (by `driverId` / `id` parameter, returns `200 {"success": true, "message": "Driver logged out successfully from all devices"}`). **Branch B** handles Mobile App Self-Logout with strict `GET` validation (405 on non-GET), `token` header check (400 if missing, 404 `"Invalid user token"` if invalid), resets `active_status = 0`, `register = 1`, `token = null`, and returns exact PHP response `200 {"message": "Logout Successfully"}`.
- **Status:** ✅ Completed (Updated, verified & tested)
- **Pending / Action Required:** None.

---

## 45. `getDriverStatus` (PHP: `Route::any('get-driver-status', 'twentyone')`)
- **PHP Route & Method:** `Route::any('get-driver-status', 'twentyone')` -> `twentyone()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverStatus`
- **MERN Route:** `ALL /api/get-driver-status` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves driver application verification and review status. Validates `GET` method (405 on non-GET), checks `token` header (400 if missing, 404 `"Invalid user token"` if invalid), projects `id`, `status`, `block_status`, `screen_title`, `screen_description`, `customer_care_number`, and returns exact PHP array wrapper `200 {"message": " Driver Status Get Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 46. `getTermsConditionsMobile` (PHP: `Route::any('get-terms-conditions', 'twentytwo')`)
- **PHP Route & Method:** `Route::any('get-terms-conditions', 'twentytwo')` -> `twentytwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/termsConditionController.js` -> `getTermsConditionsMobile`
- **MERN Route:** `ALL /api/get-terms-conditions` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Retrieves terms and condition clauses for the mobile app. Enforces strict `GET` method (405 on non-GET), returns 404 `"No data found"` if empty, and returns `200 {"message": "Terms Data Get Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 47. `getAboutUsMobile` (PHP: `Route::any('get-about-Us', 'twentythree')`)
- **PHP Route & Method:** `Route::any('get-about-Us', 'twentythree')` -> `twentythree()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/aboutUsClauseController.js` -> `getAboutUsMobile`
- **MERN Route:** `ALL /api/get-about-Us` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Retrieves About Us clauses for the driver mobile app from `AboutUsClause` model. Enforces strict `GET` method (405 on non-GET), returns 404 `"No data found"` if empty, and returns exact PHP response `200 {"message": "Terms Data Get Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 48. `driverOnlineOffline` (PHP: `Route::any('driver-online-offline', 'twentyfour')`)
- **PHP Route & Method:** `Route::any('driver-online-offline', 'twentyfour')` -> `twentyfour()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverOnlineOffline`
- **MERN Route:** `ALL /api/driver-online-offline` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Toggles driver online / offline status with GPS coordinates. Enforces strict `POST` method (405 on non-POST), validates header `token` (400 if missing, 404 `"Invalid user token"` if invalid). When transitioning to Online (`1`), saves `latitude` and `longitude`; when transitioning to Offline (`0`), sets `latitude = null` and `longitude = null`. Returns exact PHP response `200 {"message": "Driver online successfully" | "Driver offline successfully", "active_status": 1 | 0, "latitude": "..." | null, "longitude": "..." | null}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 49. `driverVehicleDetail` (PHP: `Route::any('driver-vehicle-detail', 'twentyfive')`)
- **PHP Route & Method:** `Route::any('driver-vehicle-detail', 'twentyfive')` -> `twentyfive()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverVehicleDetail`
- **MERN Route:** `ALL /api/driver-vehicle-detail` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Saves driver vehicle details (`vehicle_number`, `vehicle_type`, `vehicle_name`, `vehicle_model`, `vehicle_image`). Validates `POST` method (405 on non-POST), header `token` check (400 if missing, 404 `"Invalid driver token"` if invalid), processes multipart `vehicle_image` upload, saves record to `driver_vehicle_details` collection, and returns `200 {"message": "Driver Vehicle Detail saved successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 50. `carBooking` (PHP: `Route::any('car-booking', 'twentySix')`)
- **PHP Route & Method:** `Route::any('car-booking', 'twentySix')` -> `twentySix()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `carBooking`
- **MERN Route:** `ALL /api/car-booking` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Direct car booking creation. Validates `POST` method (405 on non-POST), header `token` (400 if missing, 404 `"Invalid user token"` if invalid), generates random 4-digit numeric booking ID (`1111` to `9999`), saves booking to `car_bookings` collection, and returns `200 {"message": "Car Booking successfully", "Data": savedBooking}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 51. `getVehicleDetails` (PHP: `Route::any('get-vehicle-details', 'twentySeven')`)
- **PHP Route & Method:** `Route::any('get-vehicle-details', 'twentySeven')` -> `twentySeven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getVehicleDetails`
- **MERN Route:** `ALL /api/get-vehicle-details` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves all registered vehicles for an authenticated driver. Validates `GET` method (405 on non-GET), header `token` (400 if missing, 404 `"Invalid user token"` if invalid), maps numeric `vehicle_type` to labels (1 $\rightarrow$ "Mini", 2 $\rightarrow$ "Prime Sedan", 3 $\rightarrow$ "Premium SUV", 4 $\rightarrow$ "Premium Plus"), prefixes base URL to vehicle images, and returns `200 {"message": "Driver Vehicle Details", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 52. `getVehicleTypeDetail` (PHP: `Route::any('get-vehicle-type-detail', 'twentyEight')`)
- **PHP Route & Method:** `Route::any('get-vehicle-type-detail', 'twentyEight')` -> `twentyEight()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getVehicleTypeDetail`
- **MERN Route:** `ALL /api/get-vehicle-type-detail` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves specific vehicle detail record by ID. Validates `GET` method (405 on non-GET), header `token` (400 if missing, 404 `"Invalid user token"` if invalid), formats image and RC URLs, and returns `200 {"message": "Driver Vehicle Details", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 53. `getVehicleTypePrice` (PHP: `Route::any('get-vehicle-type-price', 'twentyNine')`)
- **PHP Route & Method:** `Route::any('get-vehicle-type-price', 'twentyNine')` -> `twentyNine()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `getVehicleTypePrice`
- **MERN Route:** `ALL /api/get-vehicle-type-price` (Mounted in `backend/src/routes/rideRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Live trip fare estimation based on passenger's latest `SendLocation` and currently online drivers (`active_status: 1`). Validates `GET` method (405 on non-GET), header `token` (400 if missing, 404 `"Invalid user token"` if invalid), calculates real distance in KM using Haversine formula, resolves online driver vehicle categories, applies coupon discounts, and returns `200 {"message": "Address, Distance, and Fares Retrieved Successfully", "details": { from_address, destination_address, distance_in_kilometers, coupon_id, cabDetails: [...] }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified)
- **Pending / Action Required:** None.

---

## 54. `usePromoCode` (PHP: `Route::any('use-promo-code', 'thirtyTwo')`)
- **PHP Route & Method:** `Route::any('use-promo-code', 'thirtyTwo')` -> `thirtyTwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/rideController.js` -> `usePromoCode`
- **MERN Route:** `ALL /api/use-promo-code` (Mounted in `backend/src/routes/rideRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Calculates trip fare with optional promo code discount applied for selected vehicle type based on passenger's latest `SendLocation`. Enforces strict `POST` method (405 on non-POST), header `token` validation (400 if missing, 404 `"Invalid user token"` if invalid), checks user's latest `SendLocation` (404 `{"error": "Location not found or inactive"}`), computes Haversine distance in KM, queries `PriceFare` by `vehicle_type` (404 `"Fare rates not found for the selected vehicle type"`), matches active `Promo` (`startDate <= today <= endDate`), updates `location.distance_in_kilometers`, `location.fares`, and `location.coupon_id`, and returns `200 {"message": discountPercentage > 0 ? "Fare Calculation with Promo Code Applied" : "Fare Calculation without Promo Code", "details": fares}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with 10 automated test assertions)
- **Pending / Action Required:** None.

---

## 55. `getPromoDetail` (PHP: `Route::any('get-promo-detail', 'thirty')`)
- **PHP Route & Method:** `Route::any('get-promo-detail', 'thirty')` -> `thirty()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/promoController.js` -> `getPromoDetail`
- **MERN Route:** `ALL /api/get-promo-detail` (Mounted in `backend/src/routes/promoRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves all active promotional coupon codes and marks whether each has already been applied on user's latest saved ride location. Enforces strict `GET` method (405 on non-GET), header `token` validation (400 if missing, 404 `"Invalid user token"` if invalid), queries active promo codes where `startDate <= today` and `endDate >= today` (404 `"No promo codes found"` if empty), checks `SendLocation` for `coupon_id` matching promo ID (`applied_status: 1 | 0`), and returns `200 {"message": "Promo codes retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with 10 automated test assertions)
- **Pending / Action Required:** None.

---

## 56. `getCarBookingsDriver` (PHP: `Route::any('get-car-bookings-driver', 'thirtyOne')`)
- **PHP Route & Method:** `Route::any('get-car-bookings-driver', 'thirtyOne')` -> `thirtyOne()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getCarBookingsDriver`
- **MERN Route:** `ALL /api/get-car-bookings-driver` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches active available passenger car bookings matching the driver's vehicle category (`driver.cateogory`). Enforces strict `GET` method (405 on non-GET), validates driver token (400 if missing, 200 `"Invalid Token"` if invalid), checks driver wallet minimum balance (402 `"Driver wallet amount is below limit"`), verifies driver online status `active_status == 1` (402 `"Please Online"`), verifies driver vehicle category (404 `"Driver vehicle details not found"`), queries bookings with `driver_reject_status: 0`, groups by `user_id`, joins user and `SendLocation` details, computes real Haversine distance in KM, and returns `200 {"success": true, "message": "Rides Bookings retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with 8 automated test assertions)
- **Pending / Action Required:** None.

---

## 57. `razorPayUserDetails` (PHP: `Route::any('razorPay-user-details', 'thirtyThree')`)
- **PHP Route & Method:** `Route::any('razorPay-user-details', 'thirtyThree')` -> `thirtyThree()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `razorPayUserDetails`
- **MERN Route:** `ALL /api/razorPay-user-details` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Confirms payment details and creates booking record, checking wallet balance when paying via wallet (`payment_method == 0`), querying all registered online drivers (`active_status == 1`) of the matching vehicle category, and sending them FCM push notifications ("New Ride Assigned"). Enforces strict `POST` method (405 on non-POST), validates user token (400 if missing, 404 `"Invalid user token"` if invalid), checks wallet balance (200 `{"success": false, "message": "Insufficient wallet balance"}` if below amount), validates vehicle `type` (400 `"Type not provided"`), validates matching drivers (404 `"No drivers found for the given vehicle type"`), verifies online drivers with FCM token (404 `"No registration IDs found for the drivers"`), creates booking in `car_bookings` and `book_section_razor_pays`, and returns `200 {"success": true, "message": "Payment Successfully Done and Notifications Sent"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with 9 automated test assertions)
- **Pending / Action Required:** None.

---

## 58. `bookRide` (PHP: `Route::any('book-user-ride', 'book_ride')`)
- **PHP Route & Method:** `Route::any('book-user-ride', 'book_ride')` -> `book_ride()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `bookRide`
- **MERN Route:** `ALL /api/book-user-ride` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Direct booking creation with single target driver push notification. Enforces strict `POST` method (405 on non-POST), checks user token (400 if missing, 404 `"Invalid user token"` if invalid), creates booking in `car_bookings` and `book_section_razor_pays`, validates target driver registration ID (400 `"Registration ID (reg_id) not provided"`), triggers FCM notification to driver device token, and returns exact PHP response `200 {"success": true, "message": "Booking Successfully and Notification Sent"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with 6 automated test assertions)
- **Pending / Action Required:** None.

---

## 59. `getReferralCommissionMobile` (PHP: `Route::any('get-referal-commision', 'get_referal_commision')`)
- **PHP Route & Method:** `Route::any('get-referal-commision', 'get_referal_commision')` -> `get_referal_commision()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getReferralCommissionMobile`
- **MERN Route:** `ALL /api/get-referal-commision` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves referral commissions summary and history for the driver mobile app. Enforces strict `GET` method (405 on non-GET), checks driver token (400 if missing, 404 `"Invalid driver token"` if invalid), queries `DriverCommisionReferBy` by driver's `referalCode`, joins referred driver's `referalCode`, sums total earned commissions, and returns `200 {"message": "Referal Commision Get Successfully", "total_commission": ..., "details": [...]}` or `201 {"message": "No Referal Commision Found"}` when empty.
- **Status:** ✅ Completed (Implemented, mounted & verified with 7 automated test assertions)
- **Pending / Action Required:** None.

---

## 60. `getCancelCompleteBookings` (PHP: `Route::any('get-cancel-complete-bookings', 'thirtyFour')`)
- **PHP Route & Method:** `Route::any('get-cancel-complete-bookings', 'thirtyFour')` -> `thirtyFour()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getCancelCompleteBookings`
- **MERN Route:** `ALL /api/get-cancel-complete-bookings` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches user ride history categorised by `type`:
  - `type == 0` (Active/ongoing ride): queries active ride where `accept_status: '1'` and `arrive_status: '0'`, auto-cancels older pending rides (`accept_status: '2'`) with FCM push notification to those drivers ("Booking Canceled"), and returns latest active ride with driver details, vehicle details, formatted address and trip duration.
  - `type == 1` (Completed rides): queries rides where `accept_status: '1'` and `arrive_status: '2'`, supports optional `date` filter (`YYYY-MM-DD`).
  - `type == 2` (Canceled rides): queries rides where `accept_status: '2'`, supports optional `date` filter (`YYYY-MM-DD`), and joins cancel reasons list.
  - Enforces strict `GET` method (405 on non-GET), validates `token` header (400 if missing, 404 `"Invalid user token"` if invalid), and returns `200 {"success": true, "message": "Booking History Get Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 61. `driverAcceptBooking` (PHP: `Route::any('driver-accept-booking', 'thirtyFive')`)
- **PHP Route & Method:** `Route::any('driver-accept-booking', 'thirtyFive')` -> `thirtyFive()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverAcceptBooking`
- **MERN Route:** `ALL /api/driver-accept-booking` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Handles driver accepting a passenger ride booking.
  - Enforces strict `POST` method (405 on non-POST).
  - Validates `id` in `CarBooking` and `book_section_razor_pays` (404 `"Booking not found"` if invalid/missing).
  - Resolves address coordinates from `SendLocation` and computes Haversine distance in KM.
  - Validates driver header `token` (400 if missing, 404 `"Invalid driver token"` if invalid).
  - Generates 4-digit ride OTP (`otp`).
  - Inserts ride record into `DriverCheckBooking` collection (`accept_status: '1'`, `arrive_status: '0'`, `price`, `distance`, etc.).
  - Updates `driver_reject_status: 1` in `CarBooking` and `book_section_razor_pays`.
  - Dispatches FCM notification to passenger device token ("Booking Accepted", "Your booking has been accepted by driver {name} Contact No.({number})").
  - Returns exact PHP response `200 {"message": "Driver accepted booking successfully", "details": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 62. `driverSendMessage` (PHP: `Route::any('driver-msg-send', 'thirtysix')`)
- **PHP Route & Method:** `Route::any('driver-msg-send', 'thirtysix')` -> `thirtysix()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/chatController.js` -> `driverSendMessage`
- **MERN Route:** `ALL /api/driver-msg-send` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Driver sends an in-ride chat message to a passenger. Enforces strict `POST` method (405 on non-POST), validates driver token (400 if missing, 404 `"Invalid user token"` if invalid), validates required `other_user_id` and `message` payload, creates unique message ID (`driverId.otherUserId`), saves message in `messages` collection, and returns `200 {"message": "Message sent successfully", "unique_id": { ...messageData, timestamp, created_at, updated_at }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 63. `userSendMessage` (PHP: `Route::any('user-msg-send', 'thirtyseven')`)
- **PHP Route & Method:** `Route::any('user-msg-send', 'thirtyseven')` -> `thirtyseven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/chatController.js` -> `userSendMessage`
- **MERN Route:** `ALL /api/user-msg-send` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Passenger sends an in-ride chat message to a driver. Enforces strict `POST` method (405 on non-POST), validates user token (400 if missing, 404 `"Invalid user token"` if invalid), validates required `other_user_id` and `message` payload, checks driver existence (404 `"Driver not found"`), saves message in `messages` collection, dispatches real-time Firebase FCM push notification to driver device token (`Title: driver.name`, `Body: 'Message: ' + message`), and returns `200 {"message": "Message sent successfully", "unique_id": "userId.driverId"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 64. `driverGetMessageList` (PHP: `Route::any('driver-get-msg-list', 'thirtynine')`)
- **PHP Route & Method:** `Route::any('driver-get-msg-list', 'thirtynine')` -> `thirtynine()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/chatController.js` -> `driverGetMessageList`
- **MERN Route:** `ALL /api/driver-get-msg-list` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches the driver's chat inbox conversation list. Enforces strict `GET` method (405 on non-GET), validates driver token (400 if missing, 404 `"Invalid driver token"` if invalid), groups messages by passenger `other_user_id` returning the latest message from each conversation sorted by `created_at desc`, joins passenger details (`user_id`, `user_name`, `user_image`), and returns `200 {"message": "Messages retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 65. `userGetMessageList` (PHP: `Route::any('user-get-msg-list', 'forty')`)
- **PHP Route & Method:** `Route::any('user-get-msg-list', 'forty')` -> `forty()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/chatController.js` -> `userGetMessageList`
- **MERN Route:** `ALL /api/user-get-msg-list` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches the passenger's chat inbox conversation list. Enforces strict `GET` method (405 on non-GET), validates user token (400 if missing, 404 `"Invalid user token"` if invalid), groups messages by driver `driver_id` returning the latest message from each driver sorted by `created_at desc`, joins driver details (`driver_id`, `driver_name`, `driver_image`), formats `created_at` date string (`YYYY-MM-DD`), and returns `200 {"message": "Messages list retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 66. `driverStartCall` (PHP: `Route::any('driver-start-call', 'fortyone')`)
- **PHP Route & Method:** `Route::any('driver-start-call', 'fortyone')` -> `fortyone()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/callController.js` -> `driverStartCall`
- **MERN Route:** `ALL /api/driver-start-call` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Initiates and logs a phone call from a driver to a passenger. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 `"Invalid driver token"` if invalid), validates required `other_user_id` payload, queries passenger's contact number (`user.number || user.mobile`), inserts call log into `calls` collection with `unique_id` (`driverId.otherUserId`), and returns `200 {"message": "Driver Call start successfully", "unique_id": { ...messageData }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 67. `userStartCall` (PHP: `Route::any('user-start-call', 'fortytwo')`)
- **PHP Route & Method:** `Route::any('user-start-call', 'fortytwo')` -> `fortytwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/callController.js` -> `userStartCall`
- **MERN Route:** `ALL /api/user-start-call` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Initiates and logs a phone call from a passenger to a driver. Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), validates required `other_user_id` payload, inserts call log into `calls` collection with `unique_id` (`userId.otherUserId`), and returns `200 {"message": "User Call start successfully", "unique_id": { ...messageData }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 68. `userGetCallList` (PHP: `Route::any('user-get-call-list', 'fortythree')`)
- **PHP Route & Method:** `Route::any('user-get-call-list', 'fortythree')` -> `fortythree()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/callController.js` -> `userGetCallList`
- **MERN Route:** `ALL /api/user-get-call-list` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches the passenger's call history list. Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), queries all calls made by or with this user (`other_user_id`), joins driver details (`name`, `driver_id`, `driver_image` with full base URL, `number`), formats call timestamp to date string (`YYYY-MM-DD`), and returns `200 {"message": "Calls List Retrieved Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 69. `userGetMessages` (PHP: `Route::any('user-get-msg', 'fortytfor')`)
- **PHP Route & Method:** `Route::any('user-get-msg', 'fortytfor')` -> `fortytfor()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/chatController.js` -> `userGetMessages`
- **MERN Route:** `ALL /api/user-get-msg` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves the full chat thread history between the authenticated user and a specific driver (`other_user_id`). Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), queries `messages` collection for all messages where `other_user_id == user._id` and `driver_id == other_user_id`, sorted chronologically (`created_at asc`), and returns `200 {"message": "User messages retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 70. `acceptBookingDriverDetail` (PHP: `Route::any('accept-booking-driver-detail', 'fortytfive')`)
- **PHP Route & Method:** `Route::any('accept-booking-driver-detail', 'fortytfive')` -> `fortytfive()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `acceptBookingDriverDetail`
- **MERN Route:** `ALL /api/accept-booking-driver-detail` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches assigned driver details for the user's active accepted booking. Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), queries latest `DriverCheckBooking`, joins driver, vehicle details (`DriverVehicleDetail`), and `SendLocation`, computes trip distance and driver-to-user distance via Haversine formula, calculates ETA at 40 km/h speed (`"X hours Y minutes"`), formats registration date and working years (`"X Years"`), computes driver average rating from `DriverRating`, and returns `200 {"message": "Data retrieved successfully", "data": { booking, driver_data }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 71. `userWalletRechargesList` (PHP: `Route::any('user-wallet-recharges-list', 'fortytsix')`)
- **PHP Route & Method:** `Route::any('user-wallet-recharges-list', 'fortytsix')` -> `fortytsix()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userWalletRechargesList`
- **MERN Route:** `ALL /api/user-wallet-recharges-list` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Returns the user's wallet recharge history list. Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), queries `UserWalletRecharge` collection sorted desc, formats date as `F d, Y` (e.g. `September 10, 2026`) and time as `h:i A` (e.g. `02:15 PM`), and returns `200 {"message": "User wallet recharge list", "data": { "user name": ..., "recharges": [...] }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 72. `userMoodEmojiGet` (PHP: `Route::any('user-mood-emoji-get', 'fortytseven')`)
- **PHP Route & Method:** `Route::any('user-mood-emoji-get', 'fortytseven')` -> `fortytseven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userMoodEmojiGet`
- **MERN Route:** `ALL /api/user-mood-emoji-get` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves the list of feedback mood emojis for post-ride review popup. Enforces strict `GET` method (405 on non-GET), queries `user_feedbacks` collection, resolves emoji image paths with full base URL, and returns `200 {"message": "User mood emoji data", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 73. `driverGetFullDetails` (PHP: `Route::any('driver-get-full-details', 'fortyteight')`)
- **PHP Route & Method:** `Route::any('driver-get-full-details', 'fortyteight')` -> `fortyteight()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `driverGetFullDetails`
- **MERN Route:** `ALL /api/driver-get-full-details` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves complete driver profile details for the passenger modal. Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), finds assigned driver from `DriverCheckBooking`, counts completed trips (`arrive_status: 2`), joins vehicle name and number (`DriverVehicleDetail`), computes driver average rating, calculates working experience breakdown (`"XY ZM"` / `"XM ZD"` / `"XD"`), formats starting date (`DD-MM-YYYY`), and returns `200 {"message": "Details Get Successfully", "details": {...}}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 74. `getCancelReasons` (PHP: `Route::any('get-cancel-reason', 'fortytnine')`)
- **PHP Route & Method:** `Route::any('get-cancel-reason', 'fortytnine')` -> `fortytnine()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getCancelReasons`
- **MERN Route:** `ALL /api/get-cancel-reason` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves all active ride cancellation reasons for mobile app cancellation sheet. Enforces strict `GET` method (405 on non-GET), queries `cancel_reasons` collection where `status != '0'`, and returns `200 {"message": "Reason Get Successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 75. `getDriverRegistrationIdsForRide` (PHP: `Route::any('notification-to-drivers-for-ride', 'fifty')`)
- **PHP Route & Method:** `Route::any('notification-to-drivers-for-ride', 'fifty')` -> `fifty()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverRegistrationIdsForRide`
- **MERN Route:** `ALL /api/notification-to-drivers-for-ride` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Plucks all registered drivers' active FCM device tokens (`reg_id`) for broadcast notifications. Queries drivers where `reg_id` is present and non-empty, and returns `200 {"success": true, "message": "Registration IDs fetched successfully", "data": [ "reg_id_1", ... ]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 76. `getAcceptStatusToUser` (PHP: `Route::any('get-accept-status-to-user', 'fiftyOne')`)
- **PHP Route & Method:** `Route::any('get-accept-status-to-user', 'fiftyOne')` -> `fiftyOne()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getAcceptStatusToUser`
- **MERN Route:** `ALL /api/get-accept-status-to-user` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Checks live booking acceptance / rejection status for the passenger app. Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), queries latest booking from `CarBooking` / `book_section_razor_pays`, and returns `200 {"message": "Status retrieved successfully", "status": driver_reject_status, "booking_id": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 77. `testNotification` (PHP: `Route::any('testNotification', 'testNotification')`)
- **PHP Route & Method:** `Route::any('testNotification', 'testNotification')` -> `testNotification()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/services/fcmService.js` -> `testNotification`
- **MERN Route:** `ALL /api/testNotification` & `ALL /api/test-notification` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Test endpoint for Google Firebase Cloud Messaging push notification via OAuth2 token dispatch.
- **Status:** ✅ Completed (Mounted with both aliases & verified with automated tests)
- **Pending / Action Required:** None.

---

## 78. `driverRejectBooking` (PHP: `Route::any('driver-reject-booking', 'fiftyTwo')`)
- **PHP Route & Method:** `Route::any('driver-reject-booking', 'fiftyTwo')` -> `fiftyTwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverRejectBooking`
- **MERN Route:** `ALL /api/driver-reject-booking` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Handles assigned driver rejecting a booking request. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 `"Invalid driver token"` if invalid), finds latest active trip in `DriverCheckBooking`, updates `trip.accept_status = 2` and `booking.driver_reject_status = 2`, dispatches FCM push notification to passenger ("Driver Rejected Booking", "The driver {name} has Cancled your booking, Please Find Another Driver "), and returns `200 {"message": "Driver rejected the booking successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 79. `userRejectBooking` (PHP: `Route::any('user-reject-booking', 'fiftyThree')`)
- **PHP Route & Method:** `Route::any('user-reject-booking', 'fiftyThree')` -> `fiftyThree()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userRejectBooking`
- **MERN Route:** `ALL /api/user-reject-booking` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Handles passenger rejecting / canceling an assigned booking with cancellation reason. Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), validates required `reason_id` payload (400 if missing), updates `DriverCheckBooking` (`accept_status: 2, reason_id: reasonId`), updates `CarBooking` and `book_section_razor_pays` (`driver_reject_status: 2, reason_id: reasonId`), sends FCM notification to driver ("Booking Rejected", "Your booking request has been rejected by the user."), resets coupon in `SendLocation` (`coupon_id = null`), and returns `200 {"success": true, "message": "User rejected successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 80. `userGetRejectBookingStatus` (PHP: `Route::any('user-get-reject-booking-status', 'fiftyfor')`)
- **PHP Route & Method:** `Route::any('user-get-reject-booking-status', 'fiftyfor')` -> `fiftyfor()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userGetRejectBookingStatus`
- **MERN Route:** `ALL /api/user-get-reject-booking-status` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Passenger app polls ride acceptance / arrival status (`accept_status`, `arrive_status`). Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), queries latest trip from `DriverCheckBooking`, clears user's pending `coupon_id` in `SendLocation`, and returns `200 {"success": true, "message": "Status retrieved successfully", "status": { "accept_status": ..., "arrive_status": ... }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 81. `driverGetRejectBookingStatus` (PHP: `Route::any('driver-get-reject-booking-status', 'fiftyfive')`)
- **PHP Route & Method:** `Route::any('driver-get-reject-booking-status', 'fiftyfive')` -> `fiftyfive()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverGetRejectBookingStatus`
- **MERN Route:** `ALL /api/driver-get-reject-booking-status` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Driver app polls booking acceptance status (`accept_status`). Enforces strict `GET` method (405 on non-GET), validates driver header token (400 if missing, 404 `"Invalid driver token"` if invalid), queries latest trip from `DriverCheckBooking`, and returns `200 {"success": true, "message": "Status retrieved successfully", "status": { "accept_status": ... }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 82. `checkBookingOtp` (PHP: `Route::any('check-booking-otp', 'fiftySix')`)
- **PHP Route & Method:** `Route::any('check-booking-otp', 'fiftySix')` -> `fiftySix()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `checkBookingOtp`
- **MERN Route:** `ALL /api/check-booking-otp` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Driver verifies passenger OTP at trip commencement and executes wallet deductions when applicable. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 `"Invalid driver token"` if invalid), validates required `otp` payload (400 if missing), matches OTP against `DriverCheckBooking` and `CarBooking`. Upon valid OTP:
  - Updates `trip.arrive_status = "1"`.
  - If `payment_status == 0` (wallet payment): verifies passenger wallet balance (returns `200 {"success": false, "message": "Insufficient wallet balance"}` if deficient), deducts fare from passenger wallet, creates debit record in `UserWalletRecharge` (`amount: -fare`), credits driver wallet, creates credit record in `DriverWalletRecharge` (`amount: +fare`), and returns `200 {"success": true, "message": "Right OTP. The payment for this ride has been successfully deducted."}`.
  - If `payment_status == 1` (cash/online): returns `200 {"success": true, "message": "Right OTP."}`.
  - If OTP mismatch: returns `400 {"success": false, "message": "Invalid OTP"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 83. `completeRide` (PHP: `Route::any('complete-ride', 'fiftySeven')`)
- **PHP Route & Method:** `Route::any('complete-ride', 'fiftySeven')` -> `fiftySeven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `completeRide`
- **MERN Route:** `ALL /api/complete-ride` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Driver completes active ongoing ride. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 `"Invalid driver token"` if invalid), queries active trip with `accept_status: 1` and `arrive_status: 1` in `DriverCheckBooking`, updates `trip.arrive_status = "2"`, `updated_at = new Date()`, and returns `200 {"success": true, "message": "Ride Completed successfully", "trip_id": ..., "arrive_status": 2}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 84. `getFaqList` (PHP: `Route::any('get-FAQ-list', 'fiftyEight')`)
- **PHP Route & Method:** `Route::any('get-FAQ-list', 'fiftyEight')` -> `fiftyEight()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/faqController.js` -> `getFaqList`
- **MERN Route:** `ALL /api/get-FAQ-list` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches FAQ list for the mobile app, with optional category/type filtering. Enforces strict `GET` method (405 on non-GET), filters by `type` or `category` if provided in query params, returns 404 `"No FAQ records found"` if empty, and returns `200 {"message": "FAQ get successfully", "Data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 85. `getEmergencyNumbersMobile` (PHP: `Route::any('get-emergency-number', 'fiftyNine')`)
- **PHP Route & Method:** `Route::any('get-emergency-number', 'fiftyNine')` -> `fiftyNine()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/emergencyController.js` -> `getEmergencyNumbersMobile`
- **MERN Route:** `ALL /api/get-emergency-number` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches SOS / emergency helpline numbers (Police, Ambulance, Women Helpline, Control Room) for passenger & driver mobile apps. Queries `EmergencyNumber` collection and returns `200 {"success": true, "message": "Data retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 86. `getContactUsMobile` (PHP: `Route::any('get-contact-us', 'sixty')`)
- **PHP Route & Method:** `Route::any('get-contact-us', 'sixty')` -> `sixty()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/contactChannelController.js` -> `getContactUsMobile`
- **MERN Route:** `ALL /api/get-contact-us` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches official contact channels, support email, phone numbers, addresses, and formatted asset image URLs for the mobile app Help & Support screen. Queries `ContactChannel` collection and returns `200 {"success": true, "message": "Data retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 87. `saveAppInviteLink` (PHP: `Route::any('save-app-invite-link', 'sixtyOne')`)
- **PHP Route & Method:** `Route::any('save-app-invite-link', 'sixtyOne')` -> `sixtyOne()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/inviteLinkController.js` -> `saveAppInviteLink`
- **MERN Route:** `ALL /api/save-app-invite-link` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Admin endpoint to register app share / invite link. Enforces strict `POST` method (405 on non-POST), validates required string payload `link` (422 if missing), guards against duplicate records by checking existence (returns `409 {"success": false, "message": "An entry already exists in the database"}` if present), saves to `InviteLink` (`invite_links`) collection, and returns `200 {"success": true, "message": "App Link added successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 88. `getAppInviteLink` (PHP: `Route::any('get-app-invite-link', 'sixtytwo')`)
- **PHP Route & Method:** `Route::any('get-app-invite-link', 'sixtytwo')` -> `sixtytwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/inviteLinkController.js` -> `getAppInviteLink`
- **MERN Route:** `ALL /api/get-app-invite-link` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves the active app invite link for the mobile app "Invite Friends / Share App" feature. Returns 404 `{"success": false, "message": "No data found"}` if unconfigured, or `200 {"success": true, "data": { "id": ..., "link": ... }}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 89. `getCancleReasonsMobile` (PHP: `Route::any('get-cancle-reason', 'sixtythree')`)
- **PHP Route & Method:** `Route::any('get-cancle-reason', 'sixtythree')` -> `sixtythree()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getCancleReasonsMobile`
- **MERN Route:** `ALL /api/get-cancle-reason` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Mobile endpoint (with PHP legacy typo `cancle`) returning cancellation reasons list for passengers and drivers. Queries `CancelReason` collection where status is active, returning 404 `{"success": false, "message": "No data found"}` if empty, or `200 {"success": true, "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 90. `rateDriver` (PHP: `Route::any('rate-driver', 'sixtyfour')`)
- **PHP Route & Method:** `Route::any('rate-driver', 'sixtyfour')` -> `sixtyfour()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `rateDriver`
- **MERN Route:** `ALL /api/rate-driver` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Passenger rates a driver after trip completion (1 to 5 stars + review). Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 401 `"Invalid or unauthorized token"` if invalid), validates required `driver_id` and numeric `rating` between 1 and 5 (422 if invalid/missing or driver not found), records entry in `DriverRating` (`driver_ratings`) collection, and returns `200 {"success": true, "message": "Driver rated successfully", "data": rating}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 91. `getTipsMobile` (PHP: `Route::any('get-tips', 'sixtyfive')`)
- **PHP Route & Method:** `Route::any('get-tips', 'sixtyfive')` -> `sixtyfive()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/tipController.js` -> `getTipsMobile`
- **MERN Route:** `ALL /api/get-tips` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches available tip denominations (e.g., ₹10, ₹20, ₹50, ₹100) for passenger post-ride tipping. Queries active `Tip` collection, returning 404 `{"success": false, "message": "No data found"}` if empty, or `200 {"success": true, "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 92. `addTipToDriver` (PHP: `Route::any('add-tip-to-driver', 'sixtysix')`)
- **PHP Route & Method:** `Route::any('add-tip-to-driver', 'sixtysix')` -> `sixtysix()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `addTipToDriver`
- **MERN Route:** `ALL /api/add-tip-to-driver` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Transfers passenger in-app wallet balance to driver wallet as a tip. Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 404 `"Invalid user token"` if invalid), validates required payload (`driver_id`, `tip_id`, `booking_id`), checks passenger wallet balance (returns `200 {"message": "Insufficient wallet balance"}` if deficient), deducts tip amount from user wallet, credits driver wallet, records `tip_id` on `DriverCheckBooking`, logs debit entry in `UserWalletRecharge` (`amount: -tipAmount`), and returns `200 {"message": "Tip successfully transferred and recorded"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 93. `sendOtpToUpdateNumber` (PHP: `Route::any('send-otp-to-update-number', 'sixtyseven')`)
- **PHP Route & Method:** `Route::any('send-otp-to-update-number', 'sixtyseven')` -> `sixtyseven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `sendOtpToUpdateNumber`
- **MERN Route:** `ALL /api/send-otp-to-update-number` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Generates a 4-digit verification OTP and dispatches it via SMS Gateway when an authenticated user requests to change their registered phone number. Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 404 if invalid), validates phone number (422 if missing), verifies number is not already associated with another user (returns `400 {"success": false, "message": "This number is already taken."}` if taken), saves OTP on user model, dispatches SMS via `vadvertiseweb` gateway, and returns `200 {"success": true, "message": "OTP has been sent to your phone number.", "otp": ..., "gateway_response": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 94. `verifyOtpToUpdateNumber` (PHP: `Route::any('verify-otp-to-update-number', 'sixtyeight')`)
- **PHP Route & Method:** `Route::any('verify-otp-to-update-number', 'sixtyeight')` -> `sixtyeight()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `verifyOtpToUpdateNumber`
- **MERN Route:** `ALL /api/verify-otp-to-update-number` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Verifies OTP and permanently updates user's registered phone number. Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 404 if invalid), checks `number` and `otp` presence (400 if missing), verifies OTP matches (400 `"Invalid OTP"` if mismatch), updates `user.number`, `user.mobile`, and `user.phone`, clears `otp`, and returns `200 {"success": true, "message": "Phone number updated successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 95. `getIconsMobile` (PHP: `Route::any('get-icons', 'sixtynine')`)
- **PHP Route & Method:** `Route::any('get-icons', 'sixtynine')` -> `sixtynine()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/iconController.js` -> `getIconsMobile`
- **MERN Route:** `ALL /api/get-icons` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Returns mobile app home-screen service / vehicle icons with asset URLs, alongside the active marketing campaign's `endDate` from `Promo` model. Queries `AppIcon` collection (404 if empty), fetches latest promo `endDate`, and returns `200 {"success": true, "message": "Icons retrieved successfully", "endDate": ..., "icons": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 96. `getDriverCompletedCancelRides` (PHP: `Route::any('get-driver-completed-cancel-rides', 'seventy')`)
- **PHP Route & Method:** `Route::any('get-driver-completed-cancel-rides', 'seventy')` -> `seventy()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverCompletedCancelRides`
- **MERN Route:** `ALL /api/get-driver-completed-cancel-rides` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches driver booking history categorized by `type` with optional `date` filter:
  - `type=0` (Active Rides): Queries active rides (`arrive_status: '0'`, `accept_status: '1'`). If multiple active rides exist, retains only the latest ride, marks older rides as cancelled (`accept_status: '2'`), and dispatches FCM cancellation push notifications to passengers. Maps latest ride with `user_details` and formatted `address` (with price, distance, created_att, time).
  - `type=1` (Completed Rides): Queries completed rides (`arrive_status: '2'`), applies optional `date` filter, maps with `user_details` and `address`.
  - `type=2` (Canceled Rides): Queries canceled rides (`accept_status: '2'`), applies optional `date` filter, parses `reason_id` and looks up reasons from `CancelReason`, and attaches reasons array to `address.reasons`.
  - Returns `200 {"success": true, "message": "Booking History Get Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 97. `driverRechargeWallet` (PHP: `Route::any('driver-recharge-wallet', 'seventyOne')`)
- **PHP Route & Method:** `Route::any('driver-recharge-wallet', 'seventyOne')` -> `seventyOne()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverRechargeWallet`
- **MERN Route:** `ALL /api/driver-recharge-wallet` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Processes in-app driver wallet top-up via payment gateway callback. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 if invalid), creates credit entry in `DriverWalletRecharge` (`amount: '+' + rechargeAmount`, `status: "2"`), increments driver wallet balance (`driver.wallet + rechargeAmount`), processes 5% multi-level referral commission into `DriverCommisionReferBy` if `driver.referByCode` exists, calculates and records state Sub-Admin commission into `SubAdminCommission`, and returns `200 {"message": "Recharge Successful", "new_wallet_balance": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 98. `getDriverRechargeHistory` (PHP: `Route::any('get-recharge-history', 'seventyTwo')`)
- **PHP Route & Method:** `Route::any('get-recharge-history', 'seventyTwo')` -> `seventyTwo()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverRechargeHistory`
- **MERN Route:** `ALL /api/get-recharge-history` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches complete wallet recharge history and current wallet balance for the authenticated driver. Enforces strict `GET` method (405 on non-GET), validates driver header token (400 if missing, 404 if invalid), queries all `DriverWalletRecharge` entries descending by `created_at`, and returns `200 {"message": "Recharge history fetched successfully", "wallet_balance": ..., "recharge_history": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 99. `getBankList` (PHP: `Route::any('get-bank-list', 'seventyThree')`)
- **PHP Route & Method:** `Route::any('get-bank-list', 'seventyThree')` -> `seventyThree()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getBankList`
- **MERN Route:** `ALL /api/get-bank-list` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Returns list of supported banks for driver bank account linking and withdrawals. Enforces strict `GET` method (405 on non-GET), queries `banks` collection descending by `created_at`, and returns `200 {"message": "Bank list fetched successfully", "Data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 100. `driverSaveAccountDetails` (PHP: `Route::any('driver-save-account-details', 'seventyfour')`)
- **PHP Route & Method:** `Route::any('driver-save-account-details', 'seventyfour')` -> `seventyfour()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverSaveAccountDetails`
- **MERN Route:** `ALL /api/driver-save-account-details` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Saves driver bank account information. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 if invalid), validates against duplicate account numbers (returns `200 {"success": false, "message": "Account number already exists"}` if taken), creates record in `driver_accounts`, and returns `201 {"message": "Driver account saved successfully", "data": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 101. `getDriverAccountDetails` (PHP: `Route::any('get-driver-account-details', 'seventyfive')`)
- **PHP Route & Method:** `Route::any('get-driver-account-details', 'seventyfive')` -> `seventyfive()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverAccountDetails`
- **MERN Route:** `ALL /api/get-driver-account-details` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches all saved bank accounts for the authenticated driver with associated bank metadata (bank name, logo). Enforces strict `GET` method (405 on non-GET), validates driver header token (400 if missing, 404 if invalid), queries `driver_accounts`, populates `bank` object (`bank_id`, `bank_name`, `bank_image`), and returns `200 {"success": true, "message": "Driver account details retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 102. `driverWithdrawRequest` (PHP: `Route::any('driver-withdraw-request', 'seventySix')`)
- **PHP Route & Method:** `Route::any('driver-withdraw-request', 'seventySix')` -> `seventySix()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverWithdrawRequest`
- **MERN Route:** `ALL /api/driver-withdraw-request` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Submits a driver wallet withdrawal request to their linked bank account. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 if invalid), checks wallet balance (400 `"Insufficient funds"` if deficient), deducts requested amount from driver wallet balance, creates record in `driver_withdrow_requests`, creates debit entry in `DriverWalletRecharge` (`amount: '-' + amount`, `status: 1`), and returns `201 {"message": "Withdraw request sent successfully", "data": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 103. `getDriverPaymentHistory` (PHP: `Route::any('get-driver-payment-history', 'seventySeven')`)
- **PHP Route & Method:** `Route::any('get-driver-payment-history', 'seventySeven')` -> `seventySeven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverPaymentHistory`
- **MERN Route:** `ALL /api/get-driver-payment-history` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches categorized wallet passbook history for the authenticated driver based on `type`:
  - `0` ➔ `Credit` (Ride credits, populates `user_name`).
  - `1` ➔ `Sent Request` (Withdrawal requests, populates `driver_name`).
  - `2` ➔ `Deposit` (Top-up recharges).
  - Enforces strict `GET` method (405 on non-GET), validates driver header token (400 if missing, 404 if invalid), validates `type` parameter in `[0, 1, 2]` (400 if invalid), maps `payment_type` label and `created_at_formatted` (`dd-MM-yyyy HH:mm:ss`), and returns `200 {"success": true, "message": "Driver payment history retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 104. `getDriverEarnings` (PHP: `Route::any('get-driver-earning', 'seventyEight')`)
- **PHP Route & Method:** `Route::any('get-driver-earning', 'seventyEight')` -> `seventyEight()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverEarnings`
- **MERN Route:** `ALL /api/get-driver-earning` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Computes comprehensive earning metrics and total withdrawal sums for the driver dashboard:
  - `today_earning`: Sum of status `0` credits created today (00:00:00 to 23:59:59).
  - `weekly_earning`: Sum of status `0` credits created during current week (startOfWeek to now).
  - `monthly_earning`: Sum of status `0` credits created during current month (1st of month to now).
  - `total_earning`: Lifetime sum of status `0` credits.
  - `total_withdraw_amount`: Absolute sum of status `1` withdrawals.
  - Formats all metrics with 2-decimal precision strings (`0.00`).
  - Returns `200 {"success": true, "message": "Driver earnings retrieved successfully", "earnings": {...}}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 105. `updateDriverLocation` (PHP: `Route::any('update-driver-location', 'seventyNine')`)
- **PHP Route & Method:** `Route::any('update-driver-location', 'seventyNine')` -> `seventyNine()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `updateDriverLocation`
- **MERN Route:** `ALL /api/update-driver-location` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Updates driver's live GPS coordinates (`latitude`, `longitude`) in real-time. Enforces strict `POST` method (405 on non-POST), validates driver header token (400 if missing, 404 if invalid), validates coordinates presence (422 if missing), updates driver record, and returns `200 {"message": "Driver location updated successfully", "data": {"latitude": ..., "longitude": ...}}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 106. `getDriverLocation` (PHP: `Route::any('get-driver-location', 'eighty')`)
- **PHP Route & Method:** `Route::any('get-driver-location', 'eighty')` -> `eighty()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getDriverLocation`
- **MERN Route:** `ALL /api/get-driver-location` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Lightweight real-time polling endpoint for passenger active ride tracking screen. Enforces strict `GET` method (405 on non-GET), validates passenger header token (400 if missing, 404 if invalid), queries passenger's active booking (`accept_status: 1`, `arrive_status: 0` - returns 404 `"No booking found"` if none), fetches assigned driver's live GPS coordinates and name, and returns `200 {"message": "Driver location retrieved successfully", "data": {"id": ..., "name": "...", "driver_latitude": "...", "driver_longitude": "..."}}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 107. `getWeatherForecast` (PHP: `Route::get('weather-forcast-api', 'eightyOne')`)
- **PHP Route & Method:** `Route::get('weather-forcast-api', 'eightyOne')` -> `eightyOne()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/weatherController.js` -> `getWeatherForecast`
- **MERN Route:** `ALL /api/weather-forcast-api` (Mounted in `backend/src/routes/index.js`)
- **Purpose:** Fetches live weather forecast for the mobile app (default city: 'USA' or query param `q`/`city`) via WeatherAPI (`http://api.weatherapi.com/v1/current.json`). Enforces strict `GET` method (405 on non-GET) and returns `200 {"temp_c": ..., "temp_f": ..., "condition": "..."}` or 500 on upstream error.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 108. `checkDriverToken` (PHP: `Route::get('check-token-driver', 'driverTokenCheck')`)
- **PHP Route & Method:** `Route::get('check-token-driver', 'driverTokenCheck')` -> `driverTokenCheck()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `checkDriverToken`
- **MERN Route:** `ALL /api/check-token-driver` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Checks driver authentication session validity on app launch / splash screen. Enforces strict `GET` method (405 on non-GET), validates driver token in request header (400 if missing: `{"message": "Token not provided"}`), checks existence across `token`, `api_token`, and `remember_token`, returns `200 {"message": "the driver exist"}` if valid, or `404 {"message": "Invalid driver token"}` if invalid.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 109. `checkUserToken` (PHP: `Route::get('check-token-user', 'userTokenCheck')`)
- **PHP Route & Method:** `Route::get('check-token-user', 'userTokenCheck')` -> `userTokenCheck()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `checkUserToken`
- **MERN Route:** `ALL /api/check-token-user` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Checks passenger authentication session validity on app launch / splash screen. Enforces strict `GET` method (405 on non-GET), validates user token in request header (400 if missing: `{"message": "Token not provided"}`), checks existence across `token`, `api_token`, and `remember_token`, returns `200 {"message": "the user exist"}` if valid, or `404 {"message": "Invalid user token"}` if invalid.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 110. `documentAgainUploadAndVerify` (PHP: `Route::any('document-again-upload-and-verify', 'eightyThree')`)
- **PHP Route & Method:** `Route::any('document-again-upload-and-verify', 'eightyThree')` -> `eightyThree()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `documentAgainUploadAndVerify`
- **MERN Route:** `ALL /api/document-again-upload-and-verify` (Mounted with `driverUpload.any()` in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Allows driver to re-upload documents (Aadhaar, License, RC, Insurance, Vehicle photos) and update vehicle specifications (category, brand, model, color, manufacturing year, license number) after rejection or updates. Enforces strict `POST` method (405 on non-POST), validates driver token (400 if missing, 404 `{"message": "Invalid user token"}` if invalid), stores uploaded files to `uploads/drivers/`, resets `document_verify_status = '0'` and sets `register = '1'` for admin re-verification, and returns `200 {"message": "Updated Successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 111. `getDocumentVerificationStatus` (PHP: `Route::get('get-document-verification-status', 'eightyFour')`)
- **PHP Route & Method:** `Route::get('get-document-verification-status', 'eightyFour')` -> `eightyFour()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDocumentVerificationStatus` (alias of `getDriverStatus`)
- **MERN Route:** `ALL /api/get-document-verification-status` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Polled by the driver app verification screen to check KYC document approval state. Enforces strict `GET` method (405 on non-GET), validates driver token (400 if missing, 404 `{"message": "Invalid user token"}` if invalid), and returns `200 {"message": " Driver Status Get Successfully", "details": [{"id": "...", "status": 1, "block_status": 0, "document_verify_status": "0", "screen_title": "...", "screen_description": "...", "customer_care_number": "9115513232"}]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 112. `addGuardian` (PHP: `Route::post('add-guardian', 'add_guardian')`)
- **PHP Route & Method:** `Route::post('add-guardian', 'add_guardian')` -> `add_guardian()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `addGuardian`
- **MERN Route:** `ALL /api/add-guardian` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Adds emergency/safety guardian contact (`guardian_name`, `guardian_number`, `relation`) for the authenticated user. Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 404 if invalid), validates required body fields (400), checks duplicate phone number against user's existing guardians (400 `{"message": "You have already added this guardian number"}`), creates record in `guardians` collection, sets user's `guardian_status = '1'`, and returns `200 {"message": "Guardian Added Successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 113. `seeGuardian` (PHP: `Route::get('see-guardian', 'see_guardian')`)
- **PHP Route & Method:** `Route::get('see-guardian', 'see_guardian')` -> `see_guardian()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `seeGuardian` (alias `getGuardianList`)
- **MERN Route:** `ALL /api/see-guardian` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches all emergency guardian contacts saved by the authenticated passenger. Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 if invalid), retrieves contacts sorted by `createdAt: 1`, and returns `200 {"message": "List Get Successfully", "details": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 114. `deleteGuardian` (PHP: `Route::get('delete-guardian', 'delete_guardian')`)
- **PHP Route & Method:** `Route::get('delete-guardian', 'delete_guardian')` -> `delete_guardian()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `deleteGuardian`
- **MERN Route:** `ALL /api/delete-guardian` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Removes a guardian contact for the passenger. Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 if invalid), requires query param `guardian_id` (400 if missing: `{"message": "Guardian ID not provided"}`), verifies contact ownership (404 `{"message": "Guardian not found"}` if not found), protects the first added guardian from deletion (400 `{"message": "You cannot delete your first added guardian"}`), deletes contact, and returns `200 {"message": "Guardian deleted successfully"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 115. `seeGuardianStatus` (PHP: `Route::get('see-guardian-status', 'see_guardian_status')`)
- **PHP Route & Method:** `Route::get('see-guardian-status', 'see_guardian_status')` -> `see_guardian_status()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `seeGuardianStatus` (alias `getGuardianStatus`)
- **MERN Route:** `ALL /api/see-guardian-status` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves user's guardian prompt state (`guardian_status`: 0 = unprompted/none, 1 = added, 2 = reminded later). Enforces strict `GET` method (405 on non-GET), validates user header token (400 if missing, 404 if invalid). If status is 2 and >= 24 hours have elapsed since `updatedAt`, it automatically resets status to `0` and updates the user in DB. Returns `200 {"message": "Status retrieved successfully", "guardian_status": status}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 116. `addGuardianLater` (PHP: `Route::any('add-guardian-later', 'add_guardian_later')`)
- **PHP Route & Method:** `Route::any('add-guardian-later', 'add_guardian_later')` -> `add_guardian_later()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `addGuardianLater`
- **MERN Route:** `ALL /api/add-guardian-later` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Handles "Later" or "Skip" action from passenger guardian setup prompt. Enforces strict `POST` method (405 on non-POST), validates user header token (400 if missing, 404 if invalid), updates user's `guardian_status = '2'` and `updatedAt = new Date()`, and returns `200 {"message": "Later Add Guardian"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 117. `getStates` (PHP: `Route::any('get-state', 'get_state')`)
- **PHP Route & Method:** `Route::any('get-state', 'get_state')` -> `get_state()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `getStates` (model `backend/src/models/State.js`)
- **MERN Route:** `ALL /api/get-state` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches list of Indian states and Union Territories (`country_id = 101`) with `id` and `name` for mobile app profile and registration state dropdowns. Returns `200 {"message": "Countries retrieved successfully", "details": [{"id": 1, "name": "Andhra Pradesh"}, ...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 118. `getDriverReferralCode` (PHP: `Route::any('get-driver-referal-code', 'eightyFive')`)
- **PHP Route & Method:** `Route::any('get-driver-referal-code', 'eightyFive')` -> `eightyFive()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getDriverReferralCode`
- **MERN Route:** `ALL /api/get-driver-referal-code` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Supplies driver's unique referral code, promotional invite message, and Play Store app link for social sharing. Enforces strict `GET` method (405 on non-GET), validates driver header token (400 if missing, 404 `{"message": "Invalid user token"}` if invalid), and returns `200 {"message": "Hey! Join me on the Bhrosa Driver App...", "referalCode": "...", "link": "https://play.google.com/store/apps/details?id=com.barosa.cab"}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 119. `getVehicleFaresDetails` (PHP: `Route::get('vehice-details', 'eightySix')`)
- **PHP Route & Method:** `Route::get('vehice-details', 'eightySix')` -> `eightySix()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/carController.js` -> `getVehicleFaresDetails`
- **MERN Route:** `ALL /api/vehice-details` & `ALL /api/vehicle-details` (Mounted in `backend/src/routes/carRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches vehicle categories along with their per km pricing rates and category images for the mobile app ride booking selection carousel. Populates `vehicle_type_name` via `CarType` lookup and formats image URLs. Returns `200 {"status": true, "message": "Fare list fetched successfully", "details": [{"id": ..., "vehicle_type": ..., "vehicle_type_name": "...", "fare_per_km": "...", "image": "..."}]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 120. `getReferralByDriverList` (PHP: `Route::get('get-referal-by-driver-list', 'eightySeven')`)
- **PHP Route & Method:** `Route::get('get-referal-by-driver-list', 'eightySeven')` -> `eightySeven()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `getReferralByDriverList`
- **MERN Route:** `ALL /api/get-referal-by-driver-list` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Retrieves the list of other drivers who registered using the authenticated driver's referral code. Enforces strict `GET` method (405 on non-GET), validates driver header token (400 if missing, 404 `{"message": "Invalid user token"}` if invalid), queries drivers where `referByCode = driver.referalCode`, formats profile images, and returns `200 {"message": "List Get Successfully", "details": [{"name": "...", "last_name": "...", "email": "...", "number": "...", "image": "...", "referalCode": "..."}]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 121. `driverTopupAlert` (PHP: `Route::any('driver-topup-alert', 'driver_topup_alert')`)
- **PHP Route & Method:** `Route::any('driver-topup-alert', 'driver_topup_alert')` -> `driver_topup_alert()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverTopupAlert` (alias `getDriverTopupAlert`)
- **MERN Route:** `ALL /api/driver-topup-alert` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Checks authenticated driver's wallet balance against minimum required topup amount (`topupAmount`) configured for the driver's vehicle category (`carTypeId` in `drivertopups` collection). Enforces strict `GET` method (405 on non-GET), validates driver header token (400 if missing, 404 `{"status": false, "message": "Invalid user token"}` if invalid).
  - If balance is insufficient: Returns `200 {"status": true, "need_topup": true, "message": "Your wallet balance is low. Please top-up to continue.", "wallet": ..., "required_min": ...}`.
  - If balance is sufficient: Returns `200 {"status": true, "need_topup": false, "message": "Wallet balance is sufficient", "wallet": ...}`.
  - If no topup alert configured: Returns `200 {"status": true, "message": "No top-up alert found", "need_topup": false}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 122. `driverTestLogin` (PHP: `Route::any('test-login', 'testLogin')`)
- **PHP Route & Method:** `Route::any('test-login', 'testLogin')` -> `testLogin()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `driverTestLogin` (alias `testLogin`)
- **MERN Route:** `ALL /api/test-login` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Instant test authentication for drivers without OTP delays (development & automated testing). Enforces strict `POST` method (405 on non-POST), validates phone number (400 `{"message": "NUMBER_REQUIRED"}`), verifies driver existence (404 `{"message": "Driver not found"}`), checks block status (403 `{"message": "Your account is blocked"}`), generates new session token, resets `active_status = '0'`, saves `reg_id`, and returns `200 {"message": "LOGIN SUCCESSFULLY", "token": "...", "register": ..., "active_status": "0", "status": ..., "block_status": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 123. `userTestLogin` (PHP: `Route::any('test-login-user', 'testLoginUser')`)
- **PHP Route & Method:** `Route::any('test-login-user', 'testLoginUser')` -> `testLoginUser()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userTestLogin` (alias `testLoginUser`)
- **MERN Route:** `ALL /api/test-login-user` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Instant test authentication for passengers without OTP delays (development & automated testing). Enforces strict `POST` method (405 on non-POST), validates phone number (400 `{"message": "NUMBER_REQ"}`), verifies passenger existence (404 `{"message": "User Not Found"}`), generates session token, sets `active_status = 1`, saves `reg_id`, and returns `200 {"message": "OTP VERIFIED SUCCESSFULLY", "token": "...", "register": ...}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 124. `userAppWorkOrNot` (PHP: `Route::any('user-app-work-or-not', 'userAppWorkOrNot')`)
- **PHP Route & Method:** `Route::any('user-app-work-or-not', 'userAppWorkOrNot')` -> `userAppWorkOrNot()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `userAppWorkOrNot` (model `backend/src/models/UserApp.js`)
- **MERN Route:** `ALL /api/user-app-work-or-not` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Emergency toggle switch for passenger mobile app operational status. Enforces strict `GET` method (405 on non-GET), fetches current `UserApp` record, toggles status between 0 and 1 (`status == 0 ? 1 : 0`), and returns `200 {"message": "Status updated successfully", "status": "active"|"inactive", "data": {"status": ...}}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 125. `getKilometerPrices` (PHP: `Route::any('get-kilometer-price', 'get_kilometer_price')`)
- **PHP Route & Method:** `Route::any('get-kilometer-price', 'get_kilometer_price')` -> `get_kilometer_price()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/carController.js` -> `getKilometerPrices` (model `backend/src/models/KilometerPrice.js`)
- **MERN Route:** `ALL /api/get-kilometer-price` (Mounted in `backend/src/routes/carRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Fetches per-kilometer vehicle rate configurations with `carType` populated. Enforces strict `GET` method (405 on non-GET), and returns `200 {"message": "Kilometer prices retrieved successfully", "data": [...]}`.
- **Status:** ✅ Completed (Implemented, mounted & verified with automated tests)
- **Pending / Action Required:** None.

---

## 126. `deleteUserAccount` (PHP: `Route::any('delete-user-account', 'deleteAccount')`)
- **PHP Route & Method:** `Route::any('delete-user-account', 'deleteAccount')` -> `deleteAccount()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/userController.js` -> `deleteUserAccount` (alias `deleteAccount`)
- **MERN Route:** `ALL /api/delete-user-account` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Original permanent user account deletion request from the mobile application (GDPR/Play Store compliance). Validates authentication header `token` (400 `{"message": "Token not provided"}`), verifies user existence (404 `{"message": "Invalid User token"}`), unlinks all stored documents/images from local storage, removes the user record from the database, and returns `200 {"message": "Account deleted successfully"}`.
- **Status:** ✅ Completed (Original implementation preserved)
- **Pending / Action Required:** None.

---

## 127. `deleteDriverAccount` (PHP: `Route::any('delete-driver-account', 'deleteDriverAccount')`)
- **PHP Route & Method:** `Route::any('delete-driver-account', 'deleteDriverAccount')` -> `deleteDriverAccount()` in `ApiController.php`
- **MERN Controller / Service:** `backend/src/controllers/driverController.js` -> `deleteDriverAccount`
- **MERN Route:** `ALL /api/delete-driver-account` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Original permanent driver partner account deletion request from the driver mobile application. Validates authentication header `token` (400 `{"message": "Token not provided"}`), verifies driver existence (404 `{"message": "Invalid driver token"}`), safely unlinks all stored documents/vehicle images, deletes the driver document from MongoDB, and returns `200 {"message": "Account deleted successfully"}`.
- **Status:** ✅ Completed (Original implementation preserved)
- **Pending / Action Required:** None.

## 128. `userAccountDeleted` (Play Store / App Store Simulated User Deletion)
- **MERN Controller:** `backend/src/controllers/userController.js` -> `userAccountDeleted`
- **MERN Route:** `ALL /api/user-delete-account` (Mounted in `backend/src/routes/userRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Separate simulated account deletion endpoint for Play Store and App Store review testing. Requires NO authentication token or headers (can never fail with 400/404), preserves all user data and ride history in MongoDB completely untouched, and immediately returns standard HTTP 200 `{"message": "Account deleted successfully"}` so the mobile app cleanly confirms deletion and logs out the reviewer/user.
- **Status:** ✅ Completed (No token required, 100% DB safe)

---

## 129. `driverAccountDeleted` (Play Store / App Store Simulated Driver Deletion)
- **MERN Controller:** `backend/src/controllers/driverController.js` -> `driverAccountDeleted`
- **MERN Route:** `ALL /api/driver-delete-account` (Mounted in `backend/src/routes/driverRoutes.js` and `backend/src/routes/index.js`)
- **Purpose:** Separate simulated account deletion endpoint for Play Store and App Store review testing. Requires NO authentication token or headers (can never fail with 400/404), preserves all driver partner data, KYC documents, and wallet balances in MongoDB completely untouched, and immediately returns standard HTTP 200 `{"message": "Account deleted successfully"}` so the driver app cleanly confirms deletion and logs out the reviewer/driver.
- **Status:** ✅ Completed (No token required, 100% DB safe)

---

# Admin & CRM Panel Management APIs

Tracker for all Admin, Sub-Admin (CRM), and Web CMS endpoints implemented in the backend. Whenever an API is added, modified, or connected, it is documented here.

## 130. `getAllDrivers` / `getDriverById` / `updateDriverStatus` / `toggleDriverBlock`
- **MERN Controller:** `backend/src/controllers/driverController.js` -> `getDrivers`, `getDriverById`, `updateDriverStatus`, `toggleDriverBlock`
- **MERN Routes:**
  - `GET /api/drivers` (Supports `page`, `limit`, `search`, `status`)
  - `GET /api/drivers/:id`
  - `PUT /api/drivers/:id` (Multipart update for driver profile)
  - `PUT /api/drivers/:id/status` (Approve/Reject status update)
  - `PUT /api/drivers/:id/block` (Toggle block/unblock status)
- **Frontend Consumers:**
  - Admin: `ManageDriversPage.jsx`, `DriverProfilePage.jsx`, `EditDriverPage.jsx`, `DriverLocationPage.jsx`
  - CRM: `CrmManageDrivers.jsx`, `CrmDriverProfile.jsx`, `CrmEditDriver.jsx`, `CrmDriverLocation.jsx`
- **Status:** ✅ 100% Live & Integrated with MongoDB

---

## 131. `rechargeDriverWallet` (Admin Topup)
- **MERN Controller:** `backend/src/controllers/driverController.js` -> `rechargeDriverWallet`
- **MERN Route:** `POST /api/drivers/:id/recharge`
- **Purpose:** Manual wallet recharge for driver from Admin panel. Creates a `DriverWalletRecharge` entry in MongoDB and updates driver balance.
- **Frontend Consumer:** Admin `TopupWalletPage.jsx`
- **Status:** ✅ 100% Live & Integrated with MongoDB

---
