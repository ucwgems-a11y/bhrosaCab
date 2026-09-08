# Bhrosa Cab — Complete Project Architecture, Codeflow & Function Documentation

> **Dokumentation Übersicht**: Yeh document **Bhrosa Cab** project ka complete technical guide hai. Isme frontend aur backend ka poora architecture, file structure, har ek file ke andar kaun-kaun se functions hain, unka kaam kya hai, aur wo kahan-kahan use ho rahe hain, sab detail me samjhaya gaya hai.

---

## 1. Project Scenario & High-Level Architecture

Bhrosa Cab ek full-stack **On-Demand Cab & Ride-Hailing Management System** hai. Isme 4 main pillars hain:

```
                                  ┌────────────────────────┐
                                  │   Public Website       │ (Landing, About, Services,
                                  │   (Vite + React)       │  Franchise, Legal, CMS)
                                  └───────────┬────────────┘
                                              │
┌────────────────────────┐                    │                    ┌────────────────────────┐
│  Admin Control Panel   │                    ▼                    │   CRM / Sub-Admin      │
│  (Master Control,      ├────────► [ REST API GATEWAY ] ◄────────┤   (Operational Rides,  │
│   Analytics, CMS,      │          [ Node + Express 5 ]           │    Drivers, Bank,      │
│   Financials, Payouts) │                    │                    │    Profile Tracking)   │
└────────────────────────┘                    ▼                    └────────────────────────┘
                                   [ MongoDB Database ]
                                              ▲
                                              │
                                  ┌───────────┴────────────┐
                                  │   Mobile App APIs      │ (Driver & User Auth,
                                  │   (Driver & Customer)  │  GPS Lat/Lng, Live Rides,
                                  └────────────────────────┘  Wallet Recharges)
```

### Tech Stack:
* **Frontend**: React 19, Vite, React Router DOM v7, Lucide React Icons, Axios (interceptors with JWT), SweetAlert2, CSS Variables (Dark/Light mode).
* **Backend**: Node.js, Express.js 5, MongoDB (Mongoose ODM), Multer (File & Image Uploads), JWT (JSON Web Tokens), Bcryptjs, Dotenv.
* **Storage**: Local uploads directory (`backend/uploads/`) with Express static file serving.

---

## 2. Backend Architecture (`backend/src/`)

### 2.1 Server Core Files

#### `backend/src/server.js`
* **Purpose**: Application ka main entry point hai jo HTTP server start karta hai aur background schedulers trigger karta hai.
* **Functions & Flow**:
  * `connectDB()`: MongoDB database connect karta hai.
  * `runMonthlyPayoutSchedule()`: Server startup par aur har 6 ghante ke interval (`setInterval`) par check karta hai ki kya aaj month ki **1st date** hai. Agar 1st date hai, toh previous month ka 5% driver referral commission automatically process karta hai.
  * `app.listen(PORT)`: Express app ko port 5000 par listen karata hai.

#### `backend/src/app.js`
* **Purpose**: Express application create aur configure karta hai.
* **Configurations**:
  * `cors()`: Cross-Origin Requests allow karta hai (frontend aur mobile apps ke liye).
  * `express.json()` & `express.urlencoded()`: Incoming JSON aur form-data parse karta hai.
  * `/uploads`: Static route banata hai taaki upload ki gayi images browser me access ho sakein.
  * `/api`: Main router mount karta hai jo sabhi sub-routes ko map karta hai.

#### `backend/src/config/db.js`
* **`connectDB()`**:
  * **Kaam**: `process.env.MONGO_URI` se MongoDB me connection establish karta hai.
  * **Use**: `server.js` me start hote hi call hota hai.

---

### 2.2 Middlewares (`backend/src/middleware/`)

| Middleware File | Function / Export | Kaam (Purpose) | Kahan Use Hota Hai |
| :--- | :--- | :--- | :--- |
| `auth.js` | `verifyToken` | Admin JWT token check karta hai `Authorization: Bearer <token>` se. Agar valid hai toh `req.user` attach karta hai. | Protected Admin Routes me (`/api/dashboard`, `/api/settings`, etc.) |
| `verifyDriverToken.js` | `verifyDriverToken` | Driver app ka app token check karta hai aur `req.driver` set karta hai. | Driver mobile routes me (`/driver-active-status`, `/driver-lat-lng-update`, etc.) |
| `verifySubAdminToken.js` | `verifySubAdminToken` | Sub-admin (CRM user) ka token verify karta hai aur `req.subAdmin` attach karta hai. | CRM specific routes me (`/api/sub-admin/...`) |
| `driverUpload.js` | Multer instance | Driver photos, DL front/back, RC, Aadhaar, aur vehicle images ko `uploads/drivers/` me store karta hai. | `driverRoutes.js` me driver creation/update ke waqt |
| `carUpload.js` | Multer instance | Car category aur car images ko `uploads/cars/` me upload karta hai. | `carRoutes.js` |
| `cmsUpload.js` | Multer instance | Hero slides, website banners, promos aur service cards ki images ko `uploads/cms/` me upload karta hai. | `cmswebRoutes.js`, `settingsRoutes.js` |
| `adminUpload.js` | Multer instance | Admin aur Sub-Admin ki profile images ko `uploads/admin/` me store karta hai. | `subAdminAuthRoutes.js`, `authRoutes.js` |

---

### 2.3 Database Models (`backend/src/models/`)

1. **`User.js`**: Customer details store karta hai (name, phone, email, appToken, fcmToken, isActive, wallet, block_status).
2. **`Driver.js`**: Driver details store karta hai (name, last_name, number, email, referalCode, referByCode, wallet, status, active_status, vehicle details, document images, lat/lng).
3. **`Booking.js`**: Rides/Bookings ka complete record (user_id, driver_id, from, to, distance, totalFare, rideOtp, status: `pending`, `arrived`, `ongoing`, `completed`, `cancelled`).
4. **`DriverWalletRecharge.js`**: Driver ke wallet transactions (amount, transaction_id, status, booking_id, date).
5. **`DriverCommisionReferBy.js`**: 5% Driver Referral Commission table (driver_id, referByCode, referrer_id, amount, commisionInPercent: 5, commisionAmount, status: `'0'` Pending, `'1'` Credited, credited_at, payoutMonth).
6. **`SubAdmin.js`**: CRM Sub-admins credentials, permissions array, avatar image path, status.
7. **`Car.js` / `CarType.js` / `CarFare.js`**: Car categories, pricing per km, base fare, waiting charges, night charges.
8. **`CancelReason.js`**: Ride cancel karne ke predefined reasons (User/Driver side).
9. **`Promo.js` / `PromoCode.js`**: Discount coupons aur offers.
10. **CMS Models**: `HeroSlide.js`, `CompanyInfo.js`, `SiteHeader.js`, `AboutUs.js`, `EmergencyContact.js`, `ContactUs.js`, `TermsCondition.js`, `PrivacyPolicy.js`.

---

### 2.4 Controllers & Business Logic (`backend/src/controllers/`)

#### 1. `driverController.js` (Core Driver & Referral Engine)
* **`driverRegister(req, res)`**: Naya driver phone number se register/login karta hai aur OTP bhejta hai.
* **`driverOtpVerifyLogin(req, res)`**: OTP verify karke driver ko JWT token aur login status return karta hai.
* **`driverActiveStatus(req, res)`**: Driver ko online/offline toggle karta hai (`active_status: 1 / 0`).
* **`driverLatLngUpdate(req, res)`**: Driver ki live GPS location (`lat`, `lng`) update karta hai.
* **`driverProfile(req, res)`**: Current logged-in driver ki profile aur documents return karta hai.
* **`driverWalletHistory(req, res)`**: Driver ke wallet transactions aur ride earnings list karta hai.
* **`getDrivers(req, res)`**: Admin aur CRM ke liye sabhi drivers filter, search aur pagination ke sath fetch karta hai.
* **`getDriverById(req, res)`**: Single driver ka full document and vehicle profile details nikalta hai.
* **`updateDriverStatus(req, res)`**: Driver verification status update karta hai (Pending `1`, Approved `2`, Rejected `3`).
* **`toggleBlockStatus(req, res)`**: Driver ko Block/Unblock karta hai.
* **`updateDriver(req, res)`**: Driver details, wallet adjustment, `referByCode`, aur document images update karta hai.
* **`deleteDriver(req, res)`**: Driver record delete karta hai.
* **`getDriverWalletHistoryById(req, res)`**: Admin panel me specific driver ka wallet recharge/deduction history dikhata hai.
* **`getAllRechargeHistory(req, res)`**: Sabhi drivers ke overall recharge transactions list karta hai.
* **`getDriverRidesById(req, res)`**: Specific driver ne kaun-kaun si rides li hain unka dynamic record deta hai.
* **`logoutDriver(req, res)`**: Driver ka active app session aur token terminate karta hai.
* **`recordReferralCommission(rechargeId, driver, rechargeAmount)`**: 
  * *Logic*: Jab koi driver apna wallet recharge karta hai aur uska `referByCode` hota hai, toh referrer driver ko 5% commission calculate karke pending state (`status: '0'`) me save karta hai.
* **`getDriverReferrals(req, res)`**: Ek driver ke referral code se jitne drivers judhe hain unki list deta hai (`GET /api/drivers/:id/referrals`).
* **`getDriverReferralCommissions(req, res)`**: Driver ke earned 5% commissions ka summary (Total, Pending, Credited) aur list deta hai (`GET /api/drivers/:id/referral-commission`).
* **`processMonthlyReferralPayout(req, res)`**: Previous calendar month ke sabhi pending 5% commission ko aggregate karke referrer driver ke wallet me add karta hai, transaction log banata hai, aur status `'1'` (Credited) mark karta hai.
* **`runMonthlyPayoutSchedule()`**: Har 1st tarikh ko background automation chala kar payout execute karta hai.
* **`rechargeDriverWallet(req, res)`**: API ya Admin se driver wallet recharge karta hai aur automatically 5% referral commission record karta hai.

---

#### 2. `rideController.js` (Complete Ride Lifecycle Management)
* **`bookRide(req, res)`**: Customer ride create karta hai (pickup, destination, category, calculated distance & fare, OTP generate hota hai).
* **`getAvailableRides(req, res)`**: Nearby active drivers ko pending ride requests show karta hai.
* **`acceptRide(req, res)`**: Driver ride accept karta hai, booking `accepted` hoti hai.
* **`driverArrived(req, res)`**: Driver pickup location par pahunch kar "Arrived" mark karta hai.
* **`startRide(req, res)`**: Driver customer se OTP lekar ride start karta hai (`status: 'ongoing'`).
* **`completeRide(req, res)`**: Ride destination par khatam hoti hai (`status: 'completed'`), driver wallet se company commission deduct hota hai, aur wallet recharge transaction banta hai.
* **`cancelRide(req, res)`**: User ya Driver ride cancel karta hai with reason (`status: 'cancelled'`).
* **`getOngoingRides(req, res)`**: Panel ke liye chal rahi rides list karta hai.
* **`getCompletedRides(req, res)`**: Completed rides ka pura report deta hai.
* **`getCancelledRides(req, res)`**: Cancelled rides details deta hai.
* **`getRideById(req, res)`**: Single ride ka customer, driver, fare, map route data deta hai.

---

#### 3. `userController.js` (Customer Management)
* **`getUsers(req, res)`**: Customers list with pagination, search by name/number, active status.
* **`getUserById(req, res)`**: Customer detail, total spent, completed rides.
* **`updateUserStatus(req, res)`**: User active/inactive toggle.
* **`toggleBlockUser(req, res)`**: Fraud ya complaint par user account block karna.
* **`deleteUser(req, res)`**: User delete karna.
* **`getUserBookings(req, res)`**: Customer ki ride history.
* **`logoutUser(req, res)`**: Customer app token terminate karna.

---

#### 4. `dashboardController.js` (Admin Analytics & Stats)
* **`getDashboardStats(req, res)`**: Total users, total drivers, active drivers, total revenue, today's earnings, ongoing rides count calculate karke cards me send karta hai.
* **`getMonthlyRevenueChart(req, res)`**: Bar/Area chart ke liye monthly revenue aggregate karta hai.
* **`getRecentActivities(req, res)`**: Latest rides aur driver registrations ki live feed deta hai.

---

#### 5. `subAdminAuthController.js` (Sub-Admin / CRM User Control)
* **`createSubAdmin(req, res)`**: Super Admin naye Sub-Admin banata hai (name, email, password, roles/permissions).
* **`subAdminLogin(req, res)`**: CRM Sub-Admin login with email & password, JWT token issue karta hai.
* **`getSubAdmins(req, res)`**: Super Admin panel me sabhi Sub-Admins ki list dikhata hai.
* **`updateSubAdmin(req, res)`**: Sub-admin credentials, status, ya image update karta hai.
* **`updateSubAdminProfile(req, res)`**: CRM user khud apna profile photo upload/update karta hai.
* **`deleteSubAdmin(req, res)`**: Sub-admin remove karna.

---

#### 6. `carController.js` (Vehicle Types & Fare Rules)
* **`getCars(req, res)` / `addCar(req, res)`**: Car models manage karna.
* **`getCarTypes(req, res)` / `addCarType(req, res)`**: Vehicle categories (Mini, Sedan, SUV, Auto, Bike) manage karna.
* **`getCarFares(req, res)` / `updateCarFare(req, res)`**: Base fare, per km rate, waiting charge per minute set karna.

---

#### 7. CMS & Website Controllers
* **`heroSlideController.js`**: Landing page slider banners CRUD.
* **`cmswebController.js` / `siteHeaderController.js` / `companyInfoController.js`**: Website logo, header links, company address, phone, social media links.
* **`aboutUsClauseController.js` / `aboutCompanyController.js`**: About Us page contents.
* **`serviceCardController.js` / `serviceBannerController.js`**: Services page contents.
* **`franchiseApplicationController.js`**: Franchise inquiry forms submit aur view karna.
* **`emergencyController.js`**: SOS emergency helpline numbers manage karna.
* **`privacyPolicyController.js` & `termsConditionController.js`**: Legal documents text manage karna.

---

## 3. Frontend Architecture (`client/src/`)

### 3.1 Core Architecture & Routing (`client/src/routes/AppRoutes.jsx`)
`AppRoutes.jsx` application ka central router hai. Isme 3 primary security zones hain:

1. **Public Website Routes**: Accessible to all visitors (`/`, `/about`, `/services`, `/contact`, `/franchise`, `/event`, `/policy`).
2. **Admin Protected Routes**: `ProtectedRoute` wrapper ke andar secure hain (`/admin/*`). Admin JWT token `adminToken` check karta hai.
3. **CRM Sub-Admin Protected Routes**: `CrmProtectedRoute` wrapper ke andar secure hain (`/crm-*`). Sub-Admin token `crmToken` check karta hai.

---

### 3.2 State & Contexts (`client/src/context/`)

* **`AuthContext.jsx`**:
  * **Functions**: `login(token, user)`, `logout()`, `updateAdminUser(data)`.
  * **Kaam**: Super-Admin auth state, token persistence (`localStorage`), aur permissions store karta hai.
* **`CrmAuthContext.jsx`**:
  * **Functions**: `crmLogin(token, subAdmin)`, `crmLogout()`, `updateCrmProfile(data)`.
  * **Kaam**: Sub-admin (CRM) session maintain karta hai.
* **`ThemeContext.jsx`**:
  * **Functions**: `toggleTheme()`, `theme` state (`dark` / `light`).
  * **Kaam**: Pura UI ka theme CSS variables ke through switch karta hai.

---

### 3.3 HTTP Service Layer (`client/src/api/axios.js`)
* **`api` instance**: Axios base URL configure karta hai (`http://localhost:5000/api`).
* **Request Interceptor**: Har outgoing request me `Authorization: Bearer <adminToken>` automatically attach karta hai.

---

### 3.4 Admin Panel Modules (`client/src/components/admin/`)

#### 1. Drivers Management
* **`ManageDriversPage/`**: Sabhi drivers ki table, filters (Active, Blocked, Approved, State), search, aur actions.
* **`DriverProfilePage/`**: Driver ki photo, personal details, document images (Aadhaar, DL, RC), approve/reject buttons.
* **`DriverReferralListPage/`**:
  * **Columns**: `Sr.no`, `Driver Image`, `Name`, `Email`, `Phone no.`, `Status`.
  * **Kaam**: Driver ke referral code se join hue referred drivers ko live API se render karta hai.
* **`DriverReferralCommissionPage/`**:
  * **Cards**: Referral Driver, Referral Code, Total Earned 5% Commission, Credited vs Pending breakdown.
  * **Table**: Referred Driver, State, Mobile, Recharge Amount, Commission % (5%), Commission Amount (₹), Status, Date.
  * **Tag**: `⚡ Auto-Credit: 1st Date of Every Month` (Manual button removed; auto-engine handles payout).
* **`DriverWalletPage/` & `DriverWalletHistory/`**: Driver wallet balance aur recharge history tracking.

#### 2. Rides Management
* **`BookedRides/`**: Nayi aayi hui bookings.
* **`ArrivedRides/`**: Jahan driver pickup point par wait kar raha hai.
* **`OngoingRides/`**: Jo safar abhi chal raha hai.
* **`CompletedRides/`**: Safar pura ho chuka hai with total fare calculation.
* **`CancelledRides/`**: Cancel hui rides aur unka specific cancellation reason.

#### 3. Users Management
* **`UserListPage/`**: Registered customers, total rides, wallet balance, active toggle, force logout.
* **`UserDetailPage/`**: Customer detailed history.

#### 4. Sub-Admin & Staff Management
* **`AddSubAdminPage/` & `SeeSubAdminPage/`**: CRM users create karna, permissions allocate karna, sub-admin profile photo update karna.

#### 5. CMS & Pricing Management
* **`ManagePricePage/` & `EditCarsFarePage/`**: Car pricing, per km rates update karna.
* **`SiteHeaderEditor/` & `SectionEditor/`**: Homepage sliders, banners, company details live update karna.

---

### 3.5 CRM Sub-Admin Modules (`client/src/components/crm/`)

CRM Panel customer care aur operational executive ke liye design kiya gaya hai:

* **`CrmManageDrivers/`**: Operational drivers list, status inspection, quick search.
* **`CrmDriverProfile/` ("Driver Details & Documents")**:
  * Shows: Driver documents, vehicle pictures, verify status.
  * Actions available: `Driver Live Location` aur `Back to Drivers List`.
  * *Strictly Restricted*: `Edit Driver`, `Referral List`, aur `Referral Commission List` buttons CRM se remove kiye gaye hain taaki sub-admin sensitive data modify na kar sake.
* **`CrmRides/`**: Live rides tracking (Ongoing, Completed, Cancelled).
* **`CrmProfile/`**: Sub-admin apna personal profile photo view aur update kar sakta hai.

---

## 4. Key Cross-Cutting Workflows (Lifecycle Execution)

### Flow 1: 5% Driver Referral Commission & Monthly 1st Payout
```
[Driver B Registers with Driver A's Code]
                  │
                  ▼
[Driver B Recharges Wallet (e.g. ₹1000)]
                  │
                  ▼
[recordReferralCommission() calculates 5% = ₹50]
                  │
                  ▼
[Saved in driverCommisionReferBy with status: '0' (Pending)]
                  │
                  ▼
[1st Date of Month Arrives (e.g. 1st February)]
                  │
                  ▼
[Server Auto-Scheduler: runMonthlyPayoutSchedule()]
                  │
                  ├──► 1. Previous month pending commissions aggregated (₹50)
                  ├──► 2. Driver A Wallet credited: +₹50
                  ├──► 3. DriverWalletRecharge created: "Referral Commission Payout"
                  └──► 4. driverCommisionReferBy status updated to '1' (Credited)
```

### Flow 2: Ride Booking & Commission Deduction
```
[Customer Books Ride] ──► [Booking Created (Status: Pending, OTP Generated)]
                                     │
                                     ▼
[Driver Accepts & Arrives] ──────────► [Driver Arrived Status]
                                     │
                                     ▼
[Driver Enters OTP] ─────────────────► [Ride Ongoing Status]
                                     │
                                     ▼
[Driver Completes Ride] ─────────────► [Ride Completed Status]
                                     │
                                     ├──► 1. Total fare calculated
                                     ├──► 2. Admin Commission deducted from Driver wallet
                                     └──► 3. DriverWalletRecharge log created
```

---

## 5. Directory & File Reference Cheat Sheet

```
bhrosacab/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   ├── authController.js     # Admin Auth
│   │   │   ├── driverController.js   # Drivers, Wallet, Referral Commission (5%)
│   │   │   ├── rideController.js     # Bookings, Arrived, Ongoing, Complete
│   │   │   ├── userController.js     # Customers, Profiles, Status
│   │   │   ├── dashboardController.js# Stats, Analytics
│   │   │   ├── subAdminAuthController.js # CRM Sub-admins
│   │   │   └── carController.js      # Vehicle types, Fares
│   │   ├── middleware/
│   │   │   ├── auth.js               # Admin JWT guard
│   │   │   ├── verifyDriverToken.js  # Driver app guard
│   │   │   ├── verifySubAdminToken.js# CRM Sub-admin guard
│   │   │   └── *Upload.js            # Multer file upload handlers
│   │   ├── models/
│   │   │   ├── Driver.js
│   │   │   ├── User.js
│   │   │   ├── Booking.js
│   │   │   ├── DriverCommisionReferBy.js
│   │   │   ├── DriverWalletRecharge.js
│   │   │   └── SubAdmin.js
│   │   ├── routes/
│   │   │   ├── driverRoutes.js
│   │   │   ├── rideRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   └── index.js
│   │   ├── app.js                    # Express app setup
│   │   └── server.js                 # Server listen & 1st Date Payout Scheduler
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios HTTP client with JWT interceptor
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Admin Auth state
│   │   │   ├── CrmAuthContext.jsx    # CRM Sub-Admin state
│   │   │   └── ThemeContext.jsx      # Dark/Light Theme state
│   │   ├── components/
│   │   │   ├── admin/                # Admin Portal Components
│   │   │   │   └── drivers/
│   │   │   │       ├── DriverReferralListPage/       # 6 columns referral table
│   │   │   │       └── DriverReferralCommissionPage/ # 5% commission list & stats
│   │   │   ├── crm/                  # CRM Portal Components
│   │   │   │   ├── CrmDriverProfile/ # View documents & location only
│   │   │   │   ├── CrmRides/         # Operational rides
│   │   │   │   └── CrmProfile/       # Sub-admin profile image upload
│   │   │   └── layout/               # Header, Sidebar, Footer
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx         # Global routing & protection
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── PROJECT_DOCUMENTATION.md          # Complete Project Technical Manual
```

---
*Generated with 0 code modifications to preserve codebase integrity.*

