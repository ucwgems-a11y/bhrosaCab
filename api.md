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
- **Purpose:** Retrieves all privacy policy clauses for the mobile app, with method validation (GET only) and standard response wrapper.
- **Status:** ✅ Completed (Implemented, mounted & verified)
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
