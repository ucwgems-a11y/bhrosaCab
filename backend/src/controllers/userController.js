const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RegistrationEvent = require("../models/RegistrationEvent");
const UserWalletRecharge = require("../models/UserWalletRecharge");
const Driver = require("../models/Driver");
const Ride = require("../models/Ride");
const UserAddress = require("../models/UserAddress");
const SendLocation = require("../models/SendLocation");
const UserSaveLocation = require("../models/UserSaveLocation");
const CarBooking = require("../models/CarBooking");
const DriverCheckBooking = require("../models/DriverCheckBooking");
const DriverVehicleDetail = require("../models/DriverVehicleDetail");
const CancelReason = require("../models/CancelReason");
const UserFeedback = require("../models/UserFeedback");
const DriverRating = require("../models/DriverRating");
const Tip = require("../models/Tip");
const Guardian = require("../models/Guardian");
const State = require("../models/State");
const UserApp = require("../models/UserApp");
const fcmService = require("../services/fcmService");

// Helper to format Image URL with domain if local path 
const formatImageUrl = (imgPath, req) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
    return imgPath;
  }
  let cleanPath = imgPath.replace(/\\/g, "/");
  if (cleanPath.includes("uploads/")) {
    cleanPath = cleanPath.substring(cleanPath.indexOf("uploads/"));
  }
  const host = req ? req.get("host") : "localhost:5000";
  const protocol = req && req.protocol ? req.protocol : "http";
  return `${protocol}://${host}/${cleanPath}`;
};

const getRelativeUploadPath = (file) => {
  if (!file) return null;
  return "uploads/userImages/" + file.filename;
};

/* =========================================================================
   1. MOBILE APP APIS 
   ========================================================================= */

// @desc    1. User Registration / Login Request (Send OTP via SMS)
// @route   POST /api/user-register  OR  POST /api/user/register
exports.userRegister = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const number = req.body.number;

    if (!number || typeof number !== "string" || number.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const cleanNumber = number.trim();

    // 4-Digit Random OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Search user
    let user = await User.findOne({
      $or: [{ phone: cleanNumber }, { phone: cleanNumber.replace("+91", "") }],
    });

    let accountExit = 0;

    if (!user) {
      // Generate Unique Welcome Coupon (e.g., WELCOME5832)
      let welcomeCoupon;
      let couponExists = true;
      while (couponExists) {
        welcomeCoupon = "WELCOME" + Math.floor(1000 + Math.random() * 9000).toString();
        const existingCouponUser = await User.findOne({ welcomeCoupon });
        couponExists = !!existingCouponUser;
      }

      user = await User.create({
        phone: cleanNumber,
        otp: otp,
        welcomeCoupon: welcomeCoupon,
        couponAmount: 200,
        coupon_status: 0,
        isRegistered: false,
        isActive: false,
        wallet: 0,
      });
      accountExit = 0;
    } else {
      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Your account has been blocked. Please contact customer support.",
        });
      }

      user.otp = otp;
      await user.save();

      accountExit = user.name && user.name.trim().length > 0 ? 1 : 0;
    }

    const message = `Welcome to Bhrosa Cab! Your login verification code is ${otp}. Enter this OTP to continue your Application Login. For your security, never share this code. Thanks Bhrosa Group`;

    // SMS Gateway integration using native fetch
    let gatewayResponse = "SUCCESS";
    try {
      const url = new URL("https://msg.vadvertiseweb.com/submitsms.jsp");
      url.searchParams.append("user", "Bhrosa");
      url.searchParams.append("key", process.env.SMS_API_KEY || "880050d0b4XX");
      url.searchParams.append("mobile", cleanNumber.replace("+91", ""));
      url.searchParams.append("message", message);
      url.searchParams.append("senderid", "BHRGRP");
      url.searchParams.append("accusage", "1");
      url.searchParams.append("entityid", "1701176768268781357");
      url.searchParams.append("tempid", "1707176769746011196");

      const smsRes = await fetch(url.toString(), { method: "GET", signal: AbortSignal.timeout(15000) });
      gatewayResponse = await smsRes.text();
    } catch (smsErr) {
      console.warn("SMS Gateway warning:", smsErr.message);
      gatewayResponse = "GATEWAY_TIMEOUT_OR_SIMULATED";
    }

    return res.status(200).json({
      success: true,
      message: "OTP has been sent successfully",
      account_exit: accountExit,
      otp: process.env.NODE_ENV === "development" ? otp : undefined,
      otp: otp,
      gateway_response: gatewayResponse,
    });
  } catch (error) {
    console.error("userRegister Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
      details: error.message,
    });
  }
};

// @desc    2. User OTP Verify & Token Login
// @route   POST /api/user-otp-verify  OR  POST /api/user-otp-verify-login
exports.userOtpVerifyLogin = async (req, res) => {
  try {
    const { number, otp, reg_id } = req.body;

    if (!number || !otp) {
      return res.status(400).json({
        message: "NUMBER_AND_OTP_REQ",
      });
    }

    const cleanNumber = number.toString().trim();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({
      $or: [{ phone: cleanNumber }, { phone: cleanNumber.replace("+91", "") }],
    });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    if (user.otp !== cleanOtp) {
      return res.status(401).json({
        message: "INVALID_OTP",
        token: "0",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        mysqlId: user.mysqlId,
        phone: user.phone,
        role: "user",
      },
      process.env.JWT_SECRET || "bhrosacab_secret_key_2026_8409586058",
      { expiresIn: "365d" }
    );

    user.otp = null;
    user.isActive = true;
    user.active_status = 1;
    user.appToken = token;
    user.token = token;
    if (reg_id) {
      user.fcmToken = reg_id;
      user.reg_id = reg_id;
    }
    await user.save();

    // Save Registration Event (AppsFlyer / Marketing Campaigns)
    try {
      await RegistrationEvent.findOneAndUpdate(
        {
          userId: user._id,
          eventName: req.body.event_name || "registration_complete",
        },
        {
          $set: {
            userId: user._id,
            mysqlUserId: user.mysqlId,
            eventName: req.body.event_name || "registration_complete",
            mediaSource: req.body.media_source || null,
            campaign: req.body.campaign || null,
            campaignId: req.body.campaign_id || null,
            adset: req.body.adset || null,
            adsetId: req.body.adset_id || null,
            ad: req.body.ad || null,
            adId: req.body.ad_id || null,
            channel: req.body.channel || null,
            afStatus: req.body.af_status || null,
            installTime: req.body.install_time || null,
            platform: req.body.platform || null,
            appVersion: req.body.app_version || null,
            eventTime: req.body.event_time ? new Date(req.body.event_time) : new Date(),
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (eventErr) {
      console.warn("RegistrationEvent warning:", eventErr.message);
    }

    return res.status(200).json({
      message: "OTP VERIFIED SUCCESSFULLY",
      token: token || "0",
      register: user.isRegistered ? 1 : 0,
    });
  } catch (error) {
    console.error("userOtpVerifyLogin Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

//  3. Complete User Profile (Upload Photo & KYC Aadhaar)
// POST /api/user-complete-profile
// add aadhaar
exports.userCompleteProfile = async (req, res) => {
  try {
    const user = req.user;

    let userImage = user.image;
    let aadhaarFrontImage = user.aadhaarFront;
    let aadhaarBackImage = user.aadhaarBack;

    // Direct String URLs if passed
    if (req.body.image && typeof req.body.image === "string" && req.body.image.trim()) {
      userImage = req.body.image.trim();
    }
    if (req.body.aadhaar_front_image && typeof req.body.aadhaar_front_image === "string") {
      aadhaarFrontImage = req.body.aadhaar_front_image.trim();
    }
    if (req.body.aadhaar_back_image && typeof req.body.aadhaar_back_image === "string") {
      aadhaarBackImage = req.body.aadhaar_back_image.trim();
    }

    // Handle Uploaded Files from upload.any()
    if (req.files) {
      const filesList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const f of filesList) {
        const field = (f.fieldname || "").toLowerCase();
        const relPath = getRelativeUploadPath(f);
        if (field.includes("front") || field.includes("aadhaar_front")) {
          aadhaarFrontImage = relPath;
        } else if (field.includes("back") || field.includes("aadhaar_back")) {
          aadhaarBackImage = relPath;
        } else {
          userImage = relPath;
        }
      }
    }
    if (req.file) {
      userImage = getRelativeUploadPath(req.file);
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob || user.dob;
    user.image = userImage;
    user.aadhaarNumber = req.body.aadhaar_number || user.aadhaarNumber;
    user.aadhaarStatus = req.body.aadhaar_number_status || "verified";
    user.aadhaarFront = aadhaarFrontImage;
    user.aadhaarBack = aadhaarBackImage;
    user.isRegistered = true;

    if (req.body.lat && req.body.long) {
      user.location = {
        latitude: parseFloat(req.body.lat) || null,
        longitude: parseFloat(req.body.long) || null,
      };
    }

    await user.save();

    return res.status(200).json({
      message: "Updated Successfully",
    });
  } catch (error) {
    console.error("userCompleteProfile Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    4. Get User Profile Details
// @route   GET /api/get-profile  OR  POST /api/get-profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;

    const phoneStr = user.phone || "";
    let countryCode = "+91";
    let numberWithoutCode = phoneStr;

    if (phoneStr.startsWith("+91")) {
      countryCode = "+91";
      numberWithoutCode = phoneStr.replace("+91", "");
    } else if (phoneStr.startsWith("+")) {
      countryCode = phoneStr.substring(0, 3);
      numberWithoutCode = phoneStr.substring(3);
    }

    const fullImageUrl = formatImageUrl(user.image, req);

    const details = {
      id: user.mysqlId || user._id,
      _id: user._id,
      name: user.name || "",
      email: user.email || "",
      gender: user.gender || "",
      email_verified_at: user.emailVerifiedAt || null,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
      country_code: countryCode,
      number_without_country_code: numberWithoutCode,
      otp: user.otp || null,
      reg_id: user.fcmToken || "",
      latitude: user.location && user.location.latitude ? user.location.latitude.toString() : null,
      longitude: user.location && user.location.longitude ? user.location.longitude.toString() : null,
      active_status: user.isActive ? "1" : "0",
      register: user.isRegistered ? "1" : "0",
      dob: user.dob || "",
      nickname: user.nickName || user.name || "",
      image: fullImageUrl,
      wallet: user.wallet || 0,
      aadhaar_number: user.aadhaarNumber || null,
      aadhaar_number_status: user.aadhaarStatus || null,
      aadhaar_front_image: formatImageUrl(user.aadhaarFront, req),
      aadhaar_back_image: formatImageUrl(user.aadhaarBack, req),
    };

    return res.status(200).json({
      message: "Profile Get Successfully",
      details: details,
    });
  } catch (error) {
    console.error("getProfile Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    5. Edit User Profile
// @route   POST /api/edit-profile
exports.editProfile = async (req, res) => {
  try {
    const user = req.user;
    let userImage = user.image;
    let aadhaarFrontImage = user.aadhaarFront;
    let aadhaarBackImage = user.aadhaarBack;

    // 1. Check if Base64 or string URL passed in Body
    if (req.body.image && typeof req.body.image === "string" && req.body.image.trim()) {
      const b64 = saveBase64Image(req.body.image.trim());
      userImage = b64 || req.body.image.trim();
    }
    if (req.body.aadhaar_front_image && typeof req.body.aadhaar_front_image === "string") {
      const b64 = saveBase64Image(req.body.aadhaar_front_image.trim());
      aadhaarFrontImage = b64 || req.body.aadhaar_front_image.trim();
    }
    if (req.body.aadhaar_back_image && typeof req.body.aadhaar_back_image === "string") {
      const b64 = saveBase64Image(req.body.aadhaar_back_image.trim());
      aadhaarBackImage = b64 || req.body.aadhaar_back_image.trim();
    }

    // 2. Check Multipart Files
    if (req.files) {
      const filesList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
      for (const f of filesList) {
        const field = (f.fieldname || "").toLowerCase();
        const relPath = getRelativeUploadPath(f);
        if (field.includes("front") || field.includes("aadhaar_front")) {
          aadhaarFrontImage = relPath;
        } else if (field.includes("back") || field.includes("aadhaar_back")) {
          aadhaarBackImage = relPath;
        } else {
          userImage = relPath;
        }
      }
    }
    if (req.file) {
      userImage = getRelativeUploadPath(req.file);
    }

    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.email = req.body.email !== undefined ? req.body.email : user.email;
    user.dob = req.body.dob !== undefined ? req.body.dob : user.dob;
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    user.aadhaarNumber = req.body.aadhaar_number !== undefined ? req.body.aadhaar_number : user.aadhaarNumber;
    user.aadhaarStatus = req.body.aadhaar_number_status !== undefined ? req.body.aadhaar_number_status : user.aadhaarStatus;
    user.image = userImage;
    user.aadhaarFront = aadhaarFrontImage;
    user.aadhaarBack = aadhaarBackImage;

    await user.save();
    console.log(" [POST /api/edit-profile] User saved. Updated image is:", user.image);

    return res.status(200).json({
      message: "User Profile Updated Successfully",
    });
  } catch (error) {
    console.error("editProfile Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    6. User Logout (Hybrid: Mobile App Self-Logout & Admin Force-Logout)  
// @route   GET /api/logout  OR  POST /api/logout  OR  POST /api/users/:id/logout
exports.logoutUser = async (req, res) => {
  try {
    // -------------------------------------------------------------
    // Branch A: Admin Force Logout via Web Panel (by User ID)
    // -------------------------------------------------------------
    const targetId = req.params?.id || (req.body && (req.body.userId || req.body.id));

    if (targetId) {
      // Reject if caller is a sub-admin
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const rawToken = authHeader.split(" ")[1];
          const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
          if (decoded && decoded.role === "subadmin") {
            return res.status(403).json({
              success: false,
              message: "Sub-Admins are not authorized to force logout users.",
            });
          }
        } catch (e) {}
      }

      let user = null;
      if (targetId.toString().match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(targetId);
      }
      if (!user && !isNaN(targetId)) {
        user = await User.findOne({ mysqlId: Number(targetId) });
      }
      if (!user) {
        user = await User.findOne({ phone: targetId.toString() });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Nullify active session, token, and FCM token
      user.appToken = null;
      user.fcmToken = null;
      user.isActive = false;
      await user.save();

      console.log(`🔒 [ADMIN FORCE LOGOUT] Successfully cleared session for user: ${user.name} (${user.phone})`);

      return res.status(200).json({
        success: true,
        message: "User logged out successfully from all devices",
      });
    }

    // -------------------------------------------------------------
    // Branch B: Mobile App Self-Logout
    // -------------------------------------------------------------
    let token = req.headers["token"] || req.headers["x-access-token"];
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    let user = await User.findOne({
      $or: [{ appToken: token }, { token: token }],
    });

    if (!user) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "bhrosacab_secret_key_2026_8409586058"
        );
        if (decoded && (decoded.id || decoded.mysqlId || decoded.phone)) {
          user = await User.findOne({
            $or: [
              { _id: decoded.id },
              { mysqlId: decoded.mysqlId },
              { phone: decoded.phone },
            ],
          });
        }
      } catch (jwtErr) {
        // Token invalid / expired
      }
    }

    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    // Nullify active session, token, and status (exact PHP match)
    user.appToken = null;
    user.token = null;
    user.fcmToken = null;
    user.isActive = false;
    user.active_status = 0;
    await user.save();

    console.log(`🔒 [APP LOGOUT] User self logged out successfully: ${user.name} (${user.phone})`);

    return res.status(200).json({
      message: "Logout Successfully",
    });
  } catch (error) {
    console.error("logoutUser Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    7. User Recharge Wallet
// @route   POST /api/user-recharge-wallet
exports.userRechargeWallet = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;
    const amount = parseFloat(req.body.amount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Valid recharge amount is required",
      });
    }

    // Generate 10-character alphanumeric transaction ID
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomId = "";
    for (let i = 0; i < 10; i++) {
      randomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const transac_id = randomId;

    await UserWalletRecharge.create({
      user_id: user._id,
      amount: "+" + Math.abs(amount),
      transaction_id: transac_id,
      status: "1",
    });

    const newWalletBalance = (Number(user.wallet) || 0) + amount;
    user.wallet = newWalletBalance;
    await user.save();

    return res.status(200).json({
      message: "Payment Successful",
      new_wallet_balance: newWalletBalance,
    });
  } catch (error) {
    console.error("userRechargeWallet Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    8. Get User Wallet Transactions List
// @route   GET /api/get-transactions-list
exports.getTransactionsList = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;

    // Fetch user wallet recharge history
    const transactions = await UserWalletRecharge.find({
      $or: [{ user_id: user._id }, { user_id: user.mysqlId }],
    })
      .sort({ created_at: -1 })
      .lean();

    const history = [];

    for (const tx of transactions) {
      let driverId = null;
      let driverImage = null;
      let driverName = user.name || "";
      let vehicleNumber = null;
      let vehicleName = null;
      let averageRating = null;

      if (tx.booking_id) {
        // Find ride by booking_id
        const ride = await Ride.findOne({
          $or: [{ _id: tx.booking_id }, { booking_id: tx.booking_id }],
        }).lean();

        if (ride && ride.driver_id) {
          driverId = ride.driver_id;
          const driver = await Driver.findById(driverId).lean();
          if (driver) {
            driverName = driver.name || "";
            driverImage = formatImageUrl(driver.image, req);
            vehicleNumber = driver.vehicleNumber || null;
            vehicleName = driver.vehicleName || null;
            averageRating = driver.rating ? parseFloat(Number(driver.rating).toFixed(2)) : null;
          }
        }
      }

      const txDate = tx.created_at ? new Date(tx.created_at) : new Date();
      // Format d-m-Y H:i:s in IST
      const day = String(txDate.getDate()).padStart(2, "0");
      const month = String(txDate.getMonth() + 1).padStart(2, "0");
      const year = txDate.getFullYear();
      const hours = String(txDate.getHours()).padStart(2, "0");
      const minutes = String(txDate.getMinutes()).padStart(2, "0");
      const seconds = String(txDate.getSeconds()).padStart(2, "0");
      const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

      history.push({
        id: tx._id,
        amount: tx.amount,
        created_at: formattedDate,
        username: driverName,
        user_image: driverImage || formatImageUrl(user.image, req),
        transaction_id: tx.transaction_id,
        booking_id: tx.booking_id || null,
        driver_id: driverId,
        vehicle_number: vehicleNumber,
        vehicle_name: vehicleName,
        category: driverId ? "Taxi Expense" : "Money Added in Wallet",
        average_rating: averageRating,
        status: 1,
        date_time: tx.created_at,
        payment_methods: "My e-wallet",
      });
    }

    const walletBalance = Number(user.wallet || 0).toFixed(2);

    return res.status(200).json({
      message: "User Wallet amount Get Successfully",
      username: user.name || "",
      wallet: walletBalance,
      History: history,
    });
  } catch (error) {
    console.error("getTransactionsList Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    9. Get User Address List
// @route   GET /api/get-address-list
exports.getAddressList = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;

    const addressList = await UserAddress.find({
      $or: [{ user_id: user._id }, { user_id: user.mysqlId }],
    })
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({
      message: "Address list Get Successfully",
      address: addressList,
    });
  } catch (error) {
    console.error("getAddressList Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    10. Send User Location
// @route   POST /api/send-user-location
exports.sendUserLocation = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;

    // Update active bookings where accept_status=1 and arrive_status=0 to accept_status=2
    await Ride.updateMany(
      {
        $or: [{ user_id: user._id }, { user_id: user.mysqlId }],
        status: "booked",
      },
      {
        $set: { status: "ongoing" },
      }
    );

    await SendLocation.create({
      user_id: user._id,
      from_address: req.body.from_address || "",
      from_latitude: req.body.from_latitude || null,
      from_longitude: req.body.from_longitude || null,
      destination_address: req.body.destination_address || "",
      destination_latitude: req.body.destination_latitude || null,
      destination_longitude: req.body.destination_longitude || null,
    });

    return res.status(200).json({
      message: "Address Send Successfully",
    });
  } catch (error) {
    console.error("sendUserLocation Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    11. Get User Location & Calculate Distance
// @route   GET /api/get-user-location
exports.getUserLocation = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;

    const location = await SendLocation.findOne({
      $or: [{ user_id: user._id }, { user_id: user.mysqlId }],
    })
      .sort({ created_at: -1 })
      .lean();

    if (!location) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    let distance = "0.0";

    const fromLat = parseFloat(location.from_latitude);
    const fromLng = parseFloat(location.from_longitude);
    const toLat = parseFloat(location.destination_latitude);
    const toLng = parseFloat(location.destination_longitude);

    if (!isNaN(fromLat) && !isNaN(fromLng) && !isNaN(toLat) && !isNaN(toLng)) {
      const earthRadius = 6371000; // meters

      const toRad = (deg) => (deg * Math.PI) / 180;

      const latDelta = toRad(toLat - fromLat);
      const lonDelta = toRad(toLng - fromLng);

      const a =
        Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
        Math.cos(toRad(fromLat)) *
          Math.cos(toRad(toLat)) *
          Math.sin(lonDelta / 2) *
          Math.sin(lonDelta / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceInMeters = earthRadius * c;
      const distanceInKm = distanceInMeters / 1000;
      distance = distanceInKm.toFixed(1);
    }

    const details = {
      ...location,
      distance_in_kilometers: distance,
    };

    return res.status(200).json({
      message: "Address and Distance Retrieved Successfully",
      details: details,
    });
  } catch (error) {
    console.error("getUserLocation Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    12. Save User Favorite Location
// @route   POST /api/user-save-location
exports.userSaveLocation = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;

    const saved = await UserSaveLocation.create({
      user_id: user._id,
      name: req.body.name || "",
      from_address: req.body.from_address || "",
      from_latitude: req.body.from_latitude || null,
      from_longitude: req.body.from_longitude || null,
    });

    return res.status(200).json({
      message: "Address Saved Successfully",
      data: saved,
    });
  } catch (error) {
    console.error("userSaveLocation Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    13. Edit Saved Location
// @route   POST /api/edit-save-location
exports.editSaveLocation = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;
    const locationId = req.body.id || req.body._id;

    if (!locationId) {
      return res.status(400).json({
        message: "Location ID is required",
      });
    }

    const updateData = {
      user_id: user._id,
      name: req.body.name || "",
      from_address: req.body.from_address || "",
      from_latitude: req.body.from_latitude || null,
      from_longitude: req.body.from_longitude || null,
    };

    const isMongoId = locationId.toString().match(/^[0-9a-fA-F]{24}$/);
    const filter = isMongoId
      ? { _id: locationId, $or: [{ user_id: user._id }, { user_id: user.mysqlId }] }
      : { id: locationId, $or: [{ user_id: user._id }, { user_id: user.mysqlId }] };

    await UserSaveLocation.findOneAndUpdate(filter, { $set: updateData });

    return res.status(200).json({
      success: true,
      message: "Address updated Successfully",
    });
  } catch (error) {
    console.error("editSaveLocation Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    14. Get User Saved Locations
// @route   GET /api/get-save-location
exports.getSaveLocations = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const user = req.user;

    const data = await UserSaveLocation.find({
      $or: [{ user_id: user._id }, { user_id: user.mysqlId }],
    })
      .sort({ created_at: -1 })
      .lean();

    if (!data || data.length === 0) {
      return res.status(404).json({
        message: "No data found for this user",
      });
    }

    return res.status(200).json({
      message: "Data Retrieved Successfully",
      details: data,
    });
  } catch (error) {
    console.error("getSaveLocations Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

/* =========================================================================
   2. ADMIN & CRM PANEL USER MANAGEMENT APIS
   ========================================================================= */

// @desc    Get All Users with Search, Filter & Pagination
// @route   GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search ? req.query.search.trim() : "";
    const status = req.query.status; // 'all', 'verified', 'unverified'

    // Check if caller is a sub-admin
    let isSubAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const rawToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
        if (decoded && decoded.role === "subadmin") {
          isSubAdmin = true;
        }
      } catch (e) {}
    }

    const filter = {};

    if (status === "verified") {
      filter.isRegistered = true;
    } else if (status === "unverified") {
      filter.isRegistered = false;
    }

    if (search) {
      if (isSubAdmin) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      } else {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
      }
    }

    const totalUsers = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format for React Admin & CRM tables
    const formattedUsers = users.map((u) => {
      const formattedImg = formatImageUrl(u.image, req);
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=random`;

      return {
        id: u.mysqlId || u._id,
        _id: u._id,
        name: u.name || (isSubAdmin ? "Customer" : (u.phone ? `User ${u.phone.slice(-4)}` : "Incomplete Profile")),
        email: u.email || "N/A",
        phone: isSubAdmin ? "" : (u.phone || "N/A"),
        dob: u.dob || "N/A",
        gender: u.gender || "N/A",
        image: formattedImg || defaultAvatar,
        createdDate: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "N/A",
        blocked: u.isBlocked || false,
        isRegistered: u.isRegistered || false,
        aadhaarNumber: u.aadhaarNumber || "N/A",
        aadhaarStatus: u.aadhaarStatus || "None",
        wallet: u.wallet || 0,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedUsers.length,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit) || 1,
      currentPage: page,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("getAllUsers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      details: error.message,
    });
  }
};

// @desc    Get User Statistics Cards for Admin & CRM
// @route   GET /api/users/stats
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isRegistered: true });
    const unverifiedUsers = await User.countDocuments({ isRegistered: false });

    // Today's start timestamp
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayUsers = await User.countDocuments({
      createdAt: { $gte: startOfToday },
    });
    const todayVerified = await User.countDocuments({
      isRegistered: true,
      createdAt: { $gte: startOfToday },
    });
    const todayUnverified = await User.countDocuments({
      isRegistered: false,
      createdAt: { $gte: startOfToday },
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        todayUsers,
        verifiedUsers,
        unverifiedUsers,
        todayVerified,
        todayUnverified,
      },
    });
  } catch (error) {
    console.error("getUserStats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user statistics",
      details: error.message,
    });
  }
};

// @desc    Get Single User Details by ID
// @route   GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if caller is a sub-admin
    let isSubAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const rawToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
        if (decoded && decoded.role === "subadmin") {
          isSubAdmin = true;
        }
      } catch (e) {}
    }

    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id);
    }
    if (!user && !isNaN(id)) {
      user = await User.findOne({ mysqlId: Number(id) });
    }
    if (!user) {
      user = await User.findOne({ phone: id });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const formattedImg = formatImageUrl(user.image, req);
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&size=400`;

    return res.status(200).json({
      success: true,
      user: {
        id: user.mysqlId || user._id,
        _id: user._id,
        name: user.name || "Incomplete Profile",
        email: user.email || "N/A",
        phone: isSubAdmin ? "" : (user.phone || "N/A"),
        dob: user.dob || "N/A",
        gender: user.gender || "N/A",
        country: user.country || "India",
        state: user.state || "N/A",
        image: formattedImg || defaultAvatar,
        aadhaarNumber: user.aadhaarNumber || "Not Provided",
        aadhaarStatus: user.aadhaarStatus || "None",
        aadhaarFront: formatImageUrl(user.aadhaarFront, req),
        aadhaarBack: formatImageUrl(user.aadhaarBack, req),
        wallet: user.wallet || 0,
        blocked: user.isBlocked || false,
        isRegistered: user.isRegistered || false,
        isActive: user.isActive || false,
        location: {
          latitude: user.location?.latitude || null,
          longitude: user.location?.longitude || null,
        },
        latitude: user.location?.latitude || null,
        longitude: user.location?.longitude || null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("getUserById Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      details: error.message,
    });
  }
};

// @desc    Toggle Block/Unblock Status
// @route   PATCH /api/users/:id/toggle-block
exports.toggleBlockUser = async (req, res) => {
  try {
    // Reject if caller is a sub-admin
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const rawToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
        if (decoded && decoded.role === "subadmin") {
          return res.status(403).json({
            success: false,
            message: "Sub-Admins are not authorized to block or unblock users.",
          });
        }
      } catch (e) {}
    }

    const { id } = req.params;

    let user;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(id);
    }
    if (!user && !isNaN(id)) {
      user = await User.findOne({ mysqlId: Number(id) });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User successfully ${user.isBlocked ? "blocked" : "unblocked"}`,
      blocked: user.isBlocked,
    });
  } catch (error) {
    console.error("toggleBlockUser Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update block status",
      details: error.message,
    });
  }
};

// @desc    Get Marketing Campaigns & Media Source Statistics
// @route   GET /api/users/campaigns
exports.getCampaigns = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    // Aggregation for media sources
    const mediaSourcesAgg = await RegistrationEvent.aggregate([
      {
        $match: {
          mediaSource: { $ne: null, $nin: ["", "Organic", "organic", "null", "undefined"] },
        },
      },
      {
        $group: {
          _id: "$mediaSource",
          totalUsers: { $sum: 1 },
          campaigns: { $addToSet: "$campaign" },
          lastEvent: { $max: "$createdAt" },
        },
      },
      {
        $project: {
          _id: 0,
          id: "$_id",
          source: "$_id",
          totalUsers: 1,
          campaignsCount: { $size: "$campaigns" },
          lastEvent: 1,
        },
      },
      { $sort: { totalUsers: -1 } },
    ]);

    const nonOrganicCount = mediaSourcesAgg.reduce((acc, curr) => acc + curr.totalUsers, 0);
    const organicCount = Math.max(0, totalUsers - nonOrganicCount);

    return res.status(200).json({
      success: true,
      totalUsers,
      organicUsers: organicCount,
      nonOrganicUsers: nonOrganicCount,
      mediaSources: mediaSourcesAgg.map((m, idx) => ({ ...m, id: idx + 1 })),
    });
  } catch (error) {
    console.error("getCampaigns Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campaigns",
      details: error.message,
    });
  }
};

// @desc    Get Users Acquired by a Specific Campaign Media Source
// @route   GET /api/users/campaigns/media-source/:source
exports.getMediaSourceUsers = async (req, res) => {
  try {
    const { source } = req.params;

    const events = await RegistrationEvent.find({ mediaSource: source })
      .populate("userId", "name phone email createdAt")
      .sort({ createdAt: -1 });

    const formattedUsers = events.map((ev, index) => ({
      id: ev._id,
      name: ev.userId?.name || "Anonymous User",
      number: ev.userId?.phone || "N/A",
      eventName: ev.eventName || "af_complete_registration",
      mediaSource: ev.mediaSource || source,
      campaign: ev.campaign || "N/A",
      campaignId: ev.campaignId || "N/A",
      adset: ev.adset || "N/A",
      adsetId: ev.adsetId || "N/A",
      ad: ev.ad || "N/A",
      adId: ev.adId || "N/A",
      channel: ev.channel || "N/A",
      afStatus: ev.afStatus || "Non-organic",
      installTime: ev.installTime ? new Date(ev.installTime).toLocaleString("en-GB") : "N/A",
      platform: ev.platform || "Android",
      appVersion: ev.appVersion || "1.0.0",
      eventTime: ev.eventTime ? new Date(ev.eventTime).toLocaleString("en-GB") : new Date(ev.createdAt).toLocaleString("en-GB"),
    }));

    return res.status(200).json({
      success: true,
      count: formattedUsers.length,
      mediaSource: source,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("getMediaSourceUsers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch media source users",
      details: error.message,
    });
  }
};

// Check Coupon Number (PHP: ApiController::checkCouponNumber)
exports.checkCouponNumber = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const coupon = req.query.coupon || req.body?.coupon;
    if (!coupon || String(coupon).trim() === "") {
      return res.status(400).json({
        message: "Coupon not provided",
      });
    }

    const user = await User.findOne({ welcomeCoupon: String(coupon).trim() });
    if (!user) {
      return res.status(404).json({
        message: "Invalid coupon",
      });
    }

    const couponStatus = user.couponStatus !== undefined ? user.couponStatus : user.coupon_status;
    if (couponStatus == 1 || String(couponStatus) === "1") {
      return res.status(200).json({
        message: "Coupon already used",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon found",
      data: {
        userName: user.name || "N/A",
        welcomeCoupon: user.welcomeCoupon || "N/A",
        couponStatus: couponStatus ?? "N/A",
        couponAmount: user.couponAmount ?? "N/A",
      },
    });
  } catch (e) {
    return res.status(500).json({
      message: "An error occurred",
      details: e.message,
    });
  }
};

// Use Coupon (PHP: ApiController::userUseCoupon)
exports.userUseCoupon = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const coupon = req.query.coupon || req.body?.coupon;
    if (!coupon || String(coupon).trim() === "") {
      return res.status(400).json({
        message: "Coupon not provided",
      });
    }

    const user = await User.findOne({ welcomeCoupon: String(coupon).trim() });
    if (!user) {
      return res.status(404).json({
        message: "Invalid coupon",
      });
    }

    user.couponStatus = 1;
    user.coupon_status = 1;
    await user.save();

    return res.status(200).json({
      message: "Coupon found and used successfully",
      data: {
        userName: user.name || "N/A",
        welcomeCoupon: user.welcomeCoupon || "N/A",
        couponStatus: user.couponStatus ?? "N/A",
        couponAmount: user.couponAmount ?? "N/A",
      },
    });
  } catch (e) {
    return res.status(500).json({
      message: "An error occurred",
      details: e.message,
    });
  }
};

// @desc    Car Booking (PHP: ApiController::twentySix)
// @route   POST /api/car-booking
exports.carBooking = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const randomBookingId = Math.floor(1111 + Math.random() * 8888);

    const savedBooking = await CarBooking.create({
      booking_id: randomBookingId,
      user_id: user._id,
      car_type: req.body?.car_type ?? null,
      amount: req.body?.amount ?? null,
      Currency: req.body?.Currency ?? "₹",
    });

    if (savedBooking) {
      return res.status(200).json({
        message: "Car Booking successfully",
        Data: savedBooking,
      });
    } else {
      return res.status(400).json({
        message: "No changes made or Technical Error",
      });
    }
  } catch (ex) {
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    RazorPay User Details & Driver Notification (PHP: ApiController::thirtyThree)
// @route   POST /api/razorPay-user-details
exports.razorPayUserDetails = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const rawAmount =
      req.body.amount !== undefined ? String(req.body.amount) : "";
    const amount = rawAmount.replace(/[^0-9.]/g, "");
    const paymentStatus =
      req.body.payment_method !== undefined
        ? req.body.payment_method
        : req.body.payment_status !== undefined
        ? req.body.payment_status
        : 1;

    if (String(paymentStatus) === "0") {
      const walletBalance = Number(user.wallet) || 0;
      if (walletBalance < parseFloat(amount || 0)) {
        return res.status(200).json({
          success: false,
          message: "Insufficient wallet balance",
        });
      }
    }

    const randomBookingId = Math.floor(1111 + Math.random() * 8888);
    const data = {
      booking_id: randomBookingId,
      user_id: user._id,
      transection_id: req.body.transection_id || null,
      address_id: req.body.address_id || null,
      amount: amount,
      type: req.body.type || req.body.car_type || null,
      car_type: req.body.type || req.body.car_type || null,
      payment_status: String(paymentStatus),
      currency: "INR",
      Currency: "₹",
      driver_reject_status: 0,
      driver_id: null,
    };

    const razorPay = await CarBooking.create(data);
    try {
      if (mongoose.connection && mongoose.connection.db) {
        await mongoose.connection.db
          .collection("book_section_razor_pays")
          .insertOne({
            ...data,
            _id: razorPay._id,
            created_at: new Date(),
            updated_at: new Date(),
          });
      }
    } catch (e) {}

    const type = req.body.type || req.body.car_type;
    if (!type) {
      return res.status(400).json({
        message: "Type not provided",
      });
    }

    const vTypeFilter = [
      type,
      String(type),
      !isNaN(Number(type)) ? Number(type) : null,
    ].filter((v) => v !== null);

    const drivers = await Driver.find({
      cateogory: { $in: vTypeFilter },
    });

    if (!drivers || drivers.length === 0) {
      return res.status(404).json({
        message: "No drivers found for the given vehicle type",
      });
    }

    const onlineDrivers = drivers.filter(
      (d) =>
        Number(d.active_status) === 1 &&
        d.reg_id &&
        String(d.reg_id).trim() !== ""
    );

    const regIds = onlineDrivers.map((d) => String(d.reg_id).trim());
    if (regIds.length === 0) {
      return res.status(404).json({
        message: "No registration IDs found for the drivers",
      });
    }

    const title = "New Ride Assigned";
    const body = "Assigned on Amount: " + amount;

    for (const regId of regIds) {
      try {
        await fcmService.sendNotification(regId, title, body);
      } catch (ex) {
        console.error(`Notification error for reg_id ${regId}:`, ex.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Payment Successfully Done and Notifications Sent",
    });
  } catch (ex) {
    console.error("razorPayUserDetails Error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    Book User Ride with Direct Driver Notification (PHP: ApiController::book_ride)
// @route   POST /api/book-user-ride
exports.bookRide = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const randomBookingId = Math.floor(1111 + Math.random() * 8888);
    const data = {
      booking_id: randomBookingId,
      user_id: user._id,
      transection_id: null,
      address_id: req.body.address_id || null,
      amount: req.body.amount !== undefined ? String(req.body.amount) : null,
      type: req.body.type || req.body.car_type || null,
      car_type: req.body.type || req.body.car_type || null,
      payment_status: null,
      currency: null,
      driver_reject_status: 0,
      driver_id: null,
    };

    const razorPay = await CarBooking.create(data);
    try {
      if (mongoose.connection && mongoose.connection.db) {
        await mongoose.connection.db
          .collection("book_section_razor_pays")
          .insertOne({
            ...data,
            _id: razorPay._id,
            created_at: new Date(),
            updated_at: new Date(),
          });
      }
    } catch (e) {}

    const regId = req.body.reg_id;
    if (!regId) {
      return res.status(400).json({
        message: "Registration ID (reg_id) not provided",
      });
    }

    const title = "New Ride Assigned";
    const body = "Assigned on Amount: " + (req.body.amount || "");
    try {
      await fcmService.sendNotification(regId, title, body);
    } catch (ex) {
      console.error(`Notification error for reg_id ${regId}:`, ex.message);
    }

    return res.status(200).json({
      success: true,
      message: "Booking Successfully and Notification Sent",
    });
  } catch (ex) {
    console.error("bookRide Error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    Get Cancel / Complete / Active Bookings History (PHP: ApiController::thirtyFour)
// @route   GET /api/get-cancel-complete-bookings
exports.getCancelCompleteBookings = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const type = req.query.type !== undefined ? String(req.query.type) : "0";
    const dateQuery = req.query.date;

    const buildDateFilter = (query) => {
      if (dateQuery) {
        const start = new Date(dateQuery);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateQuery);
        end.setHours(23, 59, 59, 999);
        query.created_at = { $gte: start, $lte: end };
      }
    };

    let getDetails = [];

    // Helper to format ride details item
    const formatRideItem = async (item, isCanceled = false) => {
      const driver = await Driver.findOne({
        $or: [
          ...(mongoose.isValidObjectId(item.driver_id)
            ? [{ _id: item.driver_id }]
            : []),
          { id: item.driver_id },
          ...(!isNaN(Number(item.driver_id))
            ? [{ mysqlId: Number(item.driver_id) }]
            : []),
        ],
      }).lean();

      let vehicledetail = null;
      if (driver) {
        vehicledetail = await DriverVehicleDetail.findOne({
          $or: [
            ...(mongoose.isValidObjectId(driver._id)
              ? [{ driver_id: driver._id }]
              : []),
            { driver_id: driver._id.toString() },
            { driver_id: driver.id },
          ],
        }).lean();
      }

      let address = null;
      if (item.address_id) {
        address = await SendLocation.findOne({
          $or: [
            ...(mongoose.isValidObjectId(item.address_id)
              ? [{ _id: item.address_id }]
              : []),
            { id: item.address_id },
            { id: String(item.address_id) },
          ],
        }).lean();
      }
      if (!address) {
        address = await SendLocation.findOne({
          $or: [{ user_id: user._id }, { user_id: String(user._id) }],
        })
          .sort({ createdAt: -1, created_at: -1, _id: -1 })
          .lean();
      }
      if (!address) {
        address = {
          from_address: item.from_address || "",
          destination_address: item.destination_address || "",
          from_latitude: item.from_latitude || null,
          from_longitude: item.from_longitude || null,
          destination_latitude: item.destination_latitude || null,
          destination_longitude: item.destination_longitude || null,
        };
      }

      const createdAt = item.created_at || item.createdAt;
      const updatedAt = item.updated_at || item.updatedAt;

      const formattedAddress = {
        ...address,
        id: address._id ? String(address._id) : address.id,
        price: item.price !== undefined ? item.price : "0",
        distance: item.distance !== undefined ? item.distance : 0,
        created_att: createdAt
          ? new Date(createdAt).toISOString().replace("T", " ").substring(0, 19)
          : null,
        time:
          createdAt && updatedAt
            ? `${Math.max(1, Math.round((new Date(updatedAt) - new Date(createdAt)) / 60000))} minutes`
            : null,
      };

      if (isCanceled && item.reason_id) {
        const reasonIds = String(item.reason_id)
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
        const reasonDocs = await CancelReason.find({
          $or: [
            {
              _id: {
                $in: reasonIds.filter((id) => mongoose.isValidObjectId(id)),
              },
            },
            { id: { $in: reasonIds } },
            { mysqlId: { $in: reasonIds.map(Number).filter((n) => !isNaN(n)) } },
          ],
        }).lean();
        formattedAddress.reasons = reasonDocs.map((r) => r.reason);
      }

      const driverDetailsWithVehicle = {
        id: driver?._id ? String(driver._id) : null,
        name: driver?.name || "",
        number: driver?.number || "",
        image: formatImageUrl(driver?.image, req),
        vehicle_number: vehicledetail?.vehicle_number || "",
        vehicle_name: vehicledetail?.vehicle_name || "",
      };

      return {
        driver_details: driverDetailsWithVehicle,
        address: formattedAddress,
      };
    };

    // TYPE 0: Active / Ongoing rides
    if (type === "0") {
      const activeRides = await DriverCheckBooking.find({
        $or: [{ user_id: user._id }, { user_id: String(user._id) }],
        arrive_status: "0",
        accept_status: "1",
      })
        .sort({ created_at: -1, createdAt: -1, _id: -1 })
        .lean();

      if (activeRides.length > 0) {
        const lastRide = activeRides[0];
        const canceledRides = activeRides.slice(1);

        if (canceledRides.length > 0) {
          const cancelIds = canceledRides.map((r) => r._id);
          await DriverCheckBooking.updateMany(
            { _id: { $in: cancelIds } },
            { $set: { accept_status: "2" } }
          );

          for (const cRide of canceledRides) {
            const driver = await Driver.findOne({
              $or: [
                ...(mongoose.isValidObjectId(cRide.driver_id)
                  ? [{ _id: cRide.driver_id }]
                  : []),
                { id: cRide.driver_id },
              ],
            });
            if (driver && driver.reg_id) {
              const driverName = driver.name || "Driver";
              const title = "Booking Canceled";
              const body = `Dear ${driverName}, the booking has been canceled. Please contact support for more details.`;
              try {
                await fcmService.sendNotification(driver.reg_id, title, body);
              } catch (e) {
                console.error("Cancel notification error:", e.message);
              }
            }
          }
        }

        const formatted = await formatRideItem(lastRide);
        getDetails = [formatted];
      }
    }

    // TYPE 1: Completed rides
    if (type === "1") {
      const query = {
        $or: [{ user_id: user._id }, { user_id: String(user._id) }],
        accept_status: "1",
        arrive_status: "2",
      };
      buildDateFilter(query);

      const completedRides = await DriverCheckBooking.find(query)
        .sort({ created_at: -1, createdAt: -1, _id: -1 })
        .lean();

      getDetails = await Promise.all(
        completedRides.map((ride) => formatRideItem(ride))
      );
    }

    // TYPE 2: Canceled rides
    if (type === "2") {
      const query = {
        $or: [{ user_id: user._id }, { user_id: String(user._id) }],
        accept_status: "2",
      };
      buildDateFilter(query);

      const canceledRides = await DriverCheckBooking.find(query)
        .sort({ created_at: -1, createdAt: -1, _id: -1 })
        .lean();

      getDetails = await Promise.all(
        canceledRides.map((ride) => formatRideItem(ride, true))
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booking History Get Successfully",
      details: getDetails,
    });
  } catch (ex) {
    console.error("getCancelCompleteBookings Error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// 70. Accept Booking Driver Detail (PHP: ApiController::fortytfive -> 'accept-booking-driver-detail')
exports.acceptBookingDriverDetail = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const userCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const booking = await DriverCheckBooking.findOne({
      $or: [
        { user_id: { $in: userCriteria } },
        { accept_status: 1 },
        { accept_status: "1" },
      ],
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    if (!booking) {
      return res.status(404).json({
        message: "No booking found",
      });
    }

    // Driver Data
    const driver = await Driver.findOne({
      $or: [
        ...(mongoose.isValidObjectId(booking.driver_id)
          ? [{ _id: booking.driver_id }]
          : []),
        { id: booking.driver_id },
        ...(!isNaN(Number(booking.driver_id))
          ? [{ mysqlId: Number(booking.driver_id) }]
          : []),
      ],
    }).lean();

    // Driver Vehicle Details
    let driverVehicleDetails = null;
    if (driver) {
      driverVehicleDetails = await DriverVehicleDetail.findOne({
        $or: [
          ...(mongoose.isValidObjectId(driver._id)
            ? [{ driver_id: driver._id }]
            : []),
          { driver_id: driver._id.toString() },
          { driver_id: driver.id },
        ],
      })
        .sort({ created_at: -1, createdAt: -1, _id: -1 })
        .lean();
    }

    // Address & Haversine Distance
    const address = await SendLocation.findOne({
      user_id: { $in: userCriteria },
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    let distance = "N/A";
    let distanceUserToDriver = 0;
    let estimatedTime = "";

    const earthRadius = 6371000;
    const toRad = (val) => (Number(val) * Math.PI) / 180;

    if (
      address &&
      address.from_latitude &&
      address.from_longitude &&
      address.destination_latitude &&
      address.destination_longitude
    ) {
      const latFrom = toRad(address.from_latitude);
      const lonFrom = toRad(address.from_longitude);
      const latTo = toRad(address.destination_latitude);
      const lonTo = toRad(address.destination_longitude);

      const latDelta = latTo - latFrom;
      const lonDelta = lonTo - lonFrom;
      const a =
        Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
        Math.cos(latFrom) *
          Math.cos(latTo) *
          Math.sin(lonDelta / 2) *
          Math.sin(lonDelta / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceInMeters = earthRadius * c;
      distance = Math.round((distanceInMeters / 1000) * 100) / 100;
    }

    const userLat = address?.from_latitude;
    const userLng = address?.from_longitude;
    const driverLat = driver?.latitude || driver?.current_lat;
    const driverLng = driver?.longitude || driver?.current_lng;

    if (userLat && userLng && driverLat && driverLng) {
      const latFrom = toRad(userLat);
      const lonFrom = toRad(userLng);
      const latTo = toRad(driverLat);
      const lonTo = toRad(driverLng);

      const latDelta = latTo - latFrom;
      const lonDelta = lonTo - lonFrom;
      const a =
        Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
        Math.cos(latFrom) *
          Math.cos(latTo) *
          Math.sin(lonDelta / 2) *
          Math.sin(lonDelta / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceInMeters = earthRadius * c;
      distanceUserToDriver =
        Math.round((distanceInMeters / 1000) * 100) / 100;

      const speed = 40;
      const timeInHours = distanceUserToDriver / speed;
      const hours = Math.floor(timeInHours);
      const minutes = Math.round((timeInHours - hours) * 60);

      if (hours > 0) {
        estimatedTime += hours + " hour" + (hours > 1 ? "s " : " ");
      }
      if (minutes > 0) {
        estimatedTime += minutes + " minute" + (minutes > 1 ? "s" : "");
      }
    }

    const driverCreatedAt = driver?.created_at || driver?.createdAt;
    let driverFormattedDate = null;
    let workingYears = "0 Years";

    if (driverCreatedAt) {
      const d = new Date(driverCreatedAt);
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      driverFormattedDate = `${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
      const diffYears = Math.max(0, Math.floor((new Date() - d) / (365.25 * 24 * 60 * 60 * 1000)));
      workingYears = `${diffYears} Years`;
    }

    // Driver Ratings Average
    let averageRating = "No ratings yet";
    if (driver) {
      const driverRatingCriteria = [
        driver._id,
        driver._id.toString(),
        ...(driver.id ? [driver.id, String(driver.id)] : []),
        ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
      ];
      const ratingAgg = await DriverRating.aggregate([
        { $match: { driver_id: { $in: driverRatingCriteria } } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ]);
      if (ratingAgg.length > 0 && ratingAgg[0].avgRating !== null) {
        averageRating = Math.round(ratingAgg[0].avgRating * 10) / 10;
      }
    }

    return res.status(200).json({
      message: "Data retrieved successfully",
      data: {
        booking: {
          id: booking._id ? String(booking._id) : booking.id,
          booking_id: booking.booking_id,
          driver_id: booking.driver_id,
        },
        driver_data: {
          id: driver?._id ? String(driver._id) : driver?.id || null,
          name: driver?.name ?? "N/A",
          driver_image: formatImageUrl(driver?.image, req),
          driver_number: driver?.number ?? null,
          working_years: workingYears,
          registered_date: driverFormattedDate,
          "Vehicle Model": driverVehicleDetails?.vehicle_name ?? "N/A",
          Vehicle_number: driverVehicleDetails?.vehicle_number ?? "N/A",
          reg_id: driver?.reg_id ?? "N/A",
          from_address: address?.from_address ?? "N/A",
          from_latitude: address?.from_latitude ?? "N/A",
          from_longitude: address?.from_longitude ?? "N/A",
          destination_address: address?.destination_address ?? "N/A",
          destination_latitude: address?.destination_latitude ?? "N/A",
          destination_longitude: address?.destination_longitude ?? "N/A",
          distance: distance,
          driver_latitude: driverLat ?? "N/A",
          driver_longitude: driverLng ?? "N/A",
          user_to_driver_distance: distanceUserToDriver,
          driver_time: estimatedTime,
          otp: booking.otp || null,
          ratings: averageRating,
        },
      },
    });
  } catch (ex) {
    console.error("acceptBookingDriverDetail Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 71. User Wallet Recharges List (PHP: ApiController::fortytsix -> 'user-wallet-recharges-list')
exports.userWalletRechargesList = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const userCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const recharges = await UserWalletRecharge.find({
      user_id: { $in: userCriteria },
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const rechargeData = recharges.map((item) => {
      const createdAt = item.created_at || item.createdAt;
      const d = createdAt ? new Date(createdAt) : new Date();

      const formattedDate = `${monthNames[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedTime = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;

      return {
        transaction_id: item.transaction_id || "",
        amount: item.amount || "0",
        date: formattedDate,
        time: formattedTime,
      };
    });

    return res.status(200).json({
      message: "User wallet recharge list",
      data: {
        "user name": user.name || "",
        recharges: rechargeData,
      },
    });
  } catch (ex) {
    console.error("userWalletRechargesList Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 72. User Mood Emoji Get (PHP: ApiController::fortytseven -> 'user-mood-emoji-get')
exports.userMoodEmojiGet = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const feedbacks = await UserFeedback.find().sort({ created_at: -1, _id: -1 }).lean();

    const formattedFeedbacks = feedbacks.map((fb) => ({
      id: fb._id ? String(fb._id) : fb.id,
      title: fb.title || "",
      created_at: fb.created_at || fb.createdAt,
      emoji_image: formatImageUrl(fb.emoji, req),
    }));

    return res.status(200).json({
      message: "User mood emoji data",
      data: formattedFeedbacks,
    });
  } catch (ex) {
    console.error("userMoodEmojiGet Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 73. Driver Get Full Details (PHP: ApiController::fortyteight -> 'driver-get-full-details')
exports.driverGetFullDetails = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const userCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const driverCheckBooking = await DriverCheckBooking.findOne({
      $or: [
        { user_id: { $in: userCriteria } },
        { accept_status: 1 },
        { accept_status: "1" },
      ],
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    if (!driverCheckBooking) {
      return res.status(404).json({
        message: "No booking found",
      });
    }

    const driver = await Driver.findOne({
      $or: [
        ...(mongoose.isValidObjectId(driverCheckBooking.driver_id)
          ? [{ _id: driverCheckBooking.driver_id }]
          : []),
        { id: driverCheckBooking.driver_id },
        ...(!isNaN(Number(driverCheckBooking.driver_id))
          ? [{ mysqlId: Number(driverCheckBooking.driver_id) }]
          : []),
      ],
    }).lean();

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    const driverCriteria = [
      driver._id,
      driver._id.toString(),
      ...(driver.id ? [driver.id, String(driver.id)] : []),
      ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
    ];

    // Trips count where arrive_status == 2
    const trips = await DriverCheckBooking.countDocuments({
      driver_id: { $in: driverCriteria },
      $or: [{ arrive_status: 2 }, { arrive_status: "2" }],
    });

    // Driver Vehicle Details
    const vehicle = await DriverVehicleDetail.findOne({
      driver_id: { $in: driverCriteria },
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    // Driver Ratings Average
    let averageRating = "No ratings yet";
    const ratingAgg = await DriverRating.aggregate([
      { $match: { driver_id: { $in: driverCriteria } } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);
    if (ratingAgg.length > 0 && ratingAgg[0].avgRating !== null) {
      averageRating = Math.round(ratingAgg[0].avgRating * 10) / 10;
    }

    // Calculate experience breakdown
    const createdAt = driver.created_at || driver.createdAt || new Date();
    const start = new Date(createdAt);
    const now = new Date();

    let diffY = now.getFullYear() - start.getFullYear();
    let diffM = now.getMonth() - start.getMonth();
    let diffD = now.getDate() - start.getDate();

    if (diffD < 0) {
      diffM -= 1;
      const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      diffD += prevMonthLastDay;
    }
    if (diffM < 0) {
      diffY -= 1;
      diffM += 12;
    }

    let years = "";
    if (diffY > 0) {
      years = `${diffY}Y`;
      if (diffM > 0) {
        years += ` ${diffM}M`;
      }
    } else if (diffM > 0) {
      years = `${diffM}M`;
      if (diffD > 0) {
        years += ` ${diffD}D`;
      }
    } else if (diffD > 0) {
      years = `${diffD}D`;
    } else {
      years = "1D";
    }

    const pad = (n) => String(n).padStart(2, "0");
    const startingDate = `${pad(start.getDate())}-${pad(start.getMonth() + 1)}-${start.getFullYear()}`;

    const driverDetails = {
      ...driver,
      id: driver._id ? String(driver._id) : driver.id,
      image: formatImageUrl(driver.image, req),
      vehicle_name: vehicle?.vehicle_name ?? "Not available",
      vehicle_number: vehicle?.vehicle_number ?? "Not available",
      ratings: averageRating,
      trips: trips,
      years: years,
      startingDate: startingDate,
    };

    return res.status(200).json({
      message: "Details Get Successfully",
      details: driverDetails,
    });
  } catch (ex) {
    console.error("driverGetFullDetails Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 74. Get Cancel Reasons (PHP: ApiController::fortytnine -> 'get-cancel-reason')
exports.getCancelReasons = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const reasons = await CancelReason.find({ status: { $ne: "0" } })
      .sort({ created_at: -1, _id: -1 })
      .lean();

    const formattedReasons = reasons.map((r) => ({
      id: r._id ? String(r._id) : r.id,
      reason: r.reason || "",
      created_at: r.created_at || r.createdAt,
      updated_at: r.updated_at || r.updatedAt,
    }));

    return res.status(200).json({
      message: "Reason Get Successfully",
      data: formattedReasons,
    });
  } catch (ex) {
    console.error("getCancelReasons Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 76. Get Accept Status To User (PHP: ApiController::fiftyOne -> 'get-accept-status-to-user')
exports.getAcceptStatusToUser = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const userCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const trip = await CarBooking.findOne({
      user_id: { $in: userCriteria },
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    if (!trip) {
      return res.status(404).json({
        message: "No booking records found for this user",
      });
    }

    const statusValue =
      trip.driver_reject_status !== undefined
        ? Number(trip.driver_reject_status)
        : 0;

    return res.status(200).json({
      message: "Status retrieved successfully",
      status: statusValue,
      booking_id: trip.booking_id || (trip._id ? String(trip._id) : trip.id),
    });
  } catch (ex) {
    console.error("getAcceptStatusToUser Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 78. User Reject Booking (PHP: ApiController::fiftyThree -> 'user-reject-booking')
exports.userRejectBooking = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const userCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const trip = await DriverCheckBooking.findOne({
      user_id: { $in: userCriteria },
    }).sort({ created_at: -1, createdAt: -1, _id: -1 });

    if (!trip) {
      return res.status(404).json({
        message: "No booking records found for this user",
      });
    }

    const reasonId = req.body?.reason_id;
    if (!reasonId) {
      return res.status(400).json({
        message: "Reason ID is required",
      });
    }

    // 1. Update DriverCheckBooking
    trip.accept_status = 2;
    trip.reason_id = reasonId;
    await trip.save();

    // 2. Update CarBooking / book_section_razor_pays
    await CarBooking.updateMany(
      {
        $or: [
          ...(mongoose.isValidObjectId(trip.booking_id)
            ? [{ _id: trip.booking_id }]
            : []),
          { id: trip.booking_id },
          { booking_id: trip.booking_id },
          { user_id: { $in: userCriteria } },
        ],
      },
      {
        $set: {
          driver_reject_status: 2,
          reason_id: reasonId,
        },
      }
    );

    try {
      if (mongoose.connection && mongoose.connection.db) {
        await mongoose.connection.db
          .collection("book_section_razor_pays")
          .updateMany(
            {
              $or: [
                ...(mongoose.isValidObjectId(trip.booking_id)
                  ? [{ _id: trip.booking_id }]
                  : []),
                { id: trip.booking_id },
                { user_id: { $in: userCriteria } },
              ],
            },
            {
              $set: {
                driver_reject_status: 2,
                reason_id: reasonId,
              },
            }
          );
      }
    } catch (e) {}

    // 3. Send FCM Push Notification to Driver
    const driver = await Driver.findOne({
      $or: [
        ...(mongoose.isValidObjectId(trip.driver_id)
          ? [{ _id: trip.driver_id }]
          : []),
        { id: trip.driver_id },
        ...(!isNaN(Number(trip.driver_id))
          ? [{ mysqlId: Number(trip.driver_id) }]
          : []),
      ],
    });

    if (driver && driver.reg_id) {
      const title = "Booking Rejected";
      const body = "Your booking request has been rejected by the user.";
      try {
        await fcmService.sendNotification(driver.reg_id, title, body);
      } catch (err) {
        console.error("FCM error in userRejectBooking:", err.message);
      }
    }

    // 4. Reset coupon in last SendLocation
    await SendLocation.findOneAndUpdate(
      { user_id: { $in: userCriteria } },
      { $set: { coupon_id: null } },
      { sort: { created_at: -1, _id: -1 } }
    );

    return res.status(200).json({
      success: true,
      message: "User rejected successfully",
    });
  } catch (ex) {
    console.error("userRejectBooking Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 80. User Get Reject Booking Status (PHP: ApiController::fiftyfor -> 'user-get-reject-booking-status')
exports.userGetRejectBookingStatus = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const userCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const trip = await DriverCheckBooking.findOne({
      user_id: { $in: userCriteria },
    })
      .select("accept_status arrive_status")
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    if (!trip) {
      return res.status(404).json({
        message: "No booking records found for this user",
      });
    }

    // Reset coupon_id if present on the user's latest SendLocation
    await SendLocation.findOneAndUpdate(
      { user_id: { $in: userCriteria }, coupon_id: { $ne: null } },
      { $set: { coupon_id: null } },
      { sort: { created_at: -1, _id: -1 } }
    );

    return res.status(200).json({
      success: true,
      message: "Status retrieved successfully",
      status: {
        accept_status: !isNaN(Number(trip.accept_status))
          ? Number(trip.accept_status)
          : trip.accept_status,
        arrive_status: !isNaN(Number(trip.arrive_status))
          ? Number(trip.arrive_status)
          : trip.arrive_status,
      },
    });
  } catch (ex) {
    console.error("userGetRejectBookingStatus Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 89. Get Cancle Reasons Mobile (PHP: ApiController::sixtythree -> 'get-cancle-reason')
exports.getCancleReasonsMobile = async (req, res) => {
  try {
    const reasons = await CancelReason.find({ status: { $ne: "0" } })
      .sort({ created_at: -1, _id: -1 })
      .lean();

    if (!reasons || reasons.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found",
      });
    }

    const formattedReasons = reasons.map((r) => ({
      id: r._id ? String(r._id) : r.id,
      _id: r._id,
      reason: r.reason || "",
      status: r.status || "1",
      created_at: r.created_at || r.createdAt,
      updated_at: r.updated_at || r.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedReasons,
    });
  } catch (ex) {
    console.error("getCancleReasonsMobile Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 90. Rate Driver (PHP: ApiController::sixtyfour -> 'rate-driver')
exports.rateDriver = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or unauthorized token",
      });
    }

    const driverId = req.body?.driver_id;
    const ratingValue = Number(req.body?.rating);

    if (!driverId || isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors: {
          ...(!driverId ? { driver_id: ["The driver id field is required."] } : {}),
          ...(isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5
            ? { rating: ["The rating must be between 1 and 5."] }
            : {}),
        },
      });
    }

    const driver = await Driver.findOne({
      $or: [
        ...(mongoose.isValidObjectId(driverId) ? [{ _id: driverId }] : []),
        { id: driverId },
        ...(!isNaN(Number(driverId)) ? [{ mysqlId: Number(driverId) }] : []),
      ],
    });

    if (!driver) {
      return res.status(422).json({
        success: false,
        message: "Validation error",
        errors: {
          driver_id: ["The selected driver id is invalid."],
        },
      });
    }

    const rating = await DriverRating.create({
      driver_id: driver._id,
      user_id: user._id,
      rating: ratingValue,
      review: req.body?.review || null,
      booking_id: req.body?.booking_id || null,
    });

    return res.status(200).json({
      success: true,
      message: "Driver rated successfully",
      data: {
        id: rating._id ? String(rating._id) : rating.id,
        _id: rating._id,
        driver_id: driverId,
        user_id: user.id || (user.mysqlId ? Number(user.mysqlId) : String(user._id)),
        rating: ratingValue,
        review: rating.review,
        created_at: rating.created_at || rating.createdAt,
        updated_at: rating.updated_at || rating.updatedAt,
      },
    });
  } catch (ex) {
    console.error("rateDriver Error:", ex);
    return res.status(500).json({
      success: false,
      message: "An error occurred while rating the driver",
      error: ex.message,
    });
  }
};

// 92. Add Tip To Driver (PHP: ApiController::sixtysix -> 'add-tip-to-driver')
exports.addTipToDriver = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const { driver_id, tip_id, booking_id } = req.body;
    if (!driver_id || !tip_id || !booking_id) {
      return res.status(422).json({
        message: "Validation error: driver_id, tip_id, and booking_id are required",
      });
    }

    // Find tip
    const tip = await Tip.findOne({
      $or: [
        ...(mongoose.isValidObjectId(tip_id) ? [{ _id: tip_id }] : []),
        { id: tip_id },
        ...(!isNaN(Number(tip_id)) ? [{ mysqlId: Number(tip_id) }] : []),
      ],
    });
    if (!tip) {
      return res.status(404).json({
        message: "Tip not found",
      });
    }

    const tipAmount = Number(tip.amount) || 0;
    const userWallet = Number(user.wallet) || 0;

    if (userWallet < tipAmount) {
      return res.status(200).json({
        message: "Insufficient wallet balance",
      });
    }

    // Find driver
    const driver = await Driver.findOne({
      $or: [
        ...(mongoose.isValidObjectId(driver_id) ? [{ _id: driver_id }] : []),
        { id: driver_id },
        ...(!isNaN(Number(driver_id)) ? [{ mysqlId: Number(driver_id) }] : []),
      ],
    });
    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    const driverCriteria = [
      driver._id,
      driver._id.toString(),
      ...(driver.id ? [driver.id, String(driver.id)] : []),
      ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
    ];

    const bookingCriteria = [
      ...(mongoose.isValidObjectId(booking_id)
        ? [{ booking_id: booking_id }, { _id: booking_id }]
        : [{ booking_id: booking_id }]),
      { id: booking_id },
    ];

    const booking = await DriverCheckBooking.findOne({
      driver_id: { $in: driverCriteria },
      $or: bookingCriteria,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or does not belong to the specified driver",
      });
    }

    // Execute wallet transfer
    user.wallet = userWallet - tipAmount;
    await user.save();

    driver.wallet = (Number(driver.wallet) || 0) + tipAmount;
    await driver.save();

    booking.tip_id = tip._id ? String(tip._id) : tip.id;
    await booking.save();

    const txnId = "TIP" + Math.random().toString(36).substring(2, 12).toUpperCase();
    const now = new Date();

    await UserWalletRecharge.create({
      user_id: user._id,
      amount: String(-tipAmount),
      status: "1",
      booking_id: booking_id,
      transaction_id: txnId,
      created_at: now,
      updated_at: now,
    });

    return res.status(200).json({
      message: "Tip successfully transferred and recorded",
    });
  } catch (ex) {
    console.error("addTipToDriver Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 93. Send OTP To Update Number (PHP: ApiController::sixtyseven -> 'send-otp-to-update-number')
exports.sendOtpToUpdateNumber = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const number = req.body?.number || req.body?.mobile;
    if (!number || !String(number).trim()) {
      return res.status(422).json({
        message: "Invalid phone number",
      });
    }

    const rawNumber = String(number).trim();
    const cleanNumber = rawNumber.replace(/\D/g, "");

    // Find user by token
    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid token or user not found",
      });
    }

    // Check if number is already taken
    const existingUser = await User.findOne({
      $or: [
        { number: rawNumber },
        { number: cleanNumber },
        { mobile: rawNumber },
        { mobile: cleanNumber },
        { phone: rawNumber },
        { phone: cleanNumber },
        { mobile: "+91" + cleanNumber },
        { phone: "+91" + cleanNumber },
      ],
      _id: { $ne: user._id },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This number is already taken.",
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    user.otp = otp;
    await user.save();

    const message = `Your Bhrosa Cabs Driver Login OTP is ${otp}. Please do not share this OTP with anyone. It is valid for a limited time. Thanks Bhrosa Group`;

    let gatewayResponse = "SUCCESS";
    try {
      const url = new URL("https://msg.vadvertiseweb.com/submitsms.jsp");
      url.searchParams.append("user", "Bhrosa");
      url.searchParams.append("key", process.env.SMS_API_KEY || "880050d0b4XX");
      url.searchParams.append("mobile", cleanNumber);
      url.searchParams.append("message", message);
      url.searchParams.append("senderid", "BHRGRP");
      url.searchParams.append("accusage", "1");
      url.searchParams.append("entityid", "1701176768268781357");
      url.searchParams.append("tempid", "1707176769746011196");

      const smsRes = await fetch(url.toString(), {
        method: "GET",
        signal: AbortSignal.timeout(15000),
      });
      gatewayResponse = await smsRes.text();
    } catch (smsErr) {
      console.warn("SMS Gateway warning:", smsErr.message);
      gatewayResponse = "GATEWAY_TIMEOUT_OR_SIMULATED";
    }

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your phone number.",
      otp: otp,
      gateway_response: gatewayResponse,
    });
  } catch (ex) {
    console.error("sendOtpToUpdateNumber Error:", ex);
    return res.status(500).json({
      success: false,
      message: "Error occurred",
      details: ex.message,
    });
  }
};

// 94. Verify OTP To Update Number (PHP: ApiController::sixtyeight -> 'verify-otp-to-update-number')
exports.verifyOtpToUpdateNumber = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const number = req.body?.number || req.body?.mobile;
    const otp = req.body?.otp;

    if (!number || !otp) {
      return res.status(400).json({
        message: "Number or OTP not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid token or user not found",
      });
    }

    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const rawNumber = String(number).trim();
    const cleanNumber = rawNumber.replace(/\D/g, "");
    user.number = cleanNumber;
    user.mobile = cleanNumber;
    user.phone = cleanNumber;
    user.otp = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Phone number updated successfully",
    });
  } catch (ex) {
    console.error("verifyOtpToUpdateNumber Error:", ex);
    return res.status(500).json({
      message: "Error occurred",
      details: ex.message,
    });
  }
};

/**
 * Function 106: getDriverLocation
 * PHP: eighty
 * Route: GET /api/get-driver-location
 */
exports.getDriverLocation = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid user token" });
    }

    const userCriteria = [user._id];
    if (user.id) userCriteria.push(user.id);
    try {
      userCriteria.push(String(user._id));
    } catch (e) {}

    const booking = await DriverCheckBooking.findOne({
      user_id: { $in: userCriteria },
      accept_status: { $in: [1, "1"] },
      arrive_status: { $in: [0, "0"] },
    }).sort({ created_at: -1, createdAt: -1, _id: -1 });

    if (!booking) {
      return res.status(404).json({ message: "No booking found" });
    }

    let driverData = null;
    if (booking.driver_id) {
      driverData = await Driver.findOne({
        $or: [
          ...(mongoose.isValidObjectId(booking.driver_id) ? [{ _id: booking.driver_id }] : []),
          { id: booking.driver_id },
          { id: String(booking.driver_id) },
          { driver_id: booking.driver_id },
        ],
      }).lean();
    }

    return res.status(200).json({
      message: "Driver location retrieved successfully",
      data: {
        id: driverData ? (driverData._id ? String(driverData._id) : driverData.id) : null,
        name: driverData?.name ?? "N/A",
        driver_latitude: driverData?.latitude ?? "N/A",
        driver_longitude: driverData?.longitude ?? "N/A",
      },
    });
  } catch (ex) {
    console.error("getDriverLocation error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

/**
 * Function 109: checkUserToken
 * PHP: userTokenCheck
 * Route: GET /api/check-token-user
 */
exports.checkUserToken = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (user) {
      return res.status(200).json({
        message: "the user exist",
      });
    } else {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }
  } catch (ex) {
    console.error("checkUserToken error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

/**
 * Function 112: addGuardian
 * PHP: add_guardian
 * Route: POST /api/add-guardian
 */
exports.addGuardian = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { rememberToken: token },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const { guardian_name, guardian_number, relation } = req.body || {};

    if (!guardian_name || !guardian_number || !relation) {
      return res.status(400).json({
        message: "guardian_name, guardian_number, and relation are required",
      });
    }

    // Check duplicate guardian number
    const existingGuardian = await Guardian.findOne({
      user_id: user._id,
      number: String(guardian_number).trim(),
    });

    if (existingGuardian) {
      return res.status(400).json({
        message: "You have already added this guardian number",
      });
    }

    // Create guardian
    const create = await Guardian.create({
      user_id: user._id,
      name: String(guardian_name).trim(),
      number: String(guardian_number).trim(),
      relation: String(relation).trim(),
    });

    if (create) {
      user.guardian_status = "1";
      user.guardianStatus = "1";
      user.updatedAt = new Date();
      await user.save();

      return res.status(200).json({
        message: "Guardian Added Successfully",
      });
    } else {
      return res.status(400).json({
        message: "Failed to add guardian",
      });
    }
  } catch (ex) {
    console.error("addGuardian error:", ex);
    return res.status(500).json({
      message: "Server Error",
      details: ex.message,
    });
  }
};

/**
 * Function 113: seeGuardian
 * PHP: see_guardian
 * Route: GET /api/see-guardian
 */
exports.seeGuardian = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { rememberToken: token },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const list = await Guardian.find({ user_id: user._id }).sort({ createdAt: 1 });

    const formattedList = list.map((g) => ({
      id: g._id,
      user_id: g.user_id,
      name: g.name,
      number: g.number,
      relation: g.relation,
      created_at: g.createdAt,
      updated_at: g.updatedAt,
    }));

    return res.status(200).json({
      message: "List Get Successfully",
      details: formattedList,
    });
  } catch (ex) {
    console.error("seeGuardian error:", ex);
    return res.status(500).json({
      message: "Server Error",
      details: ex.message,
    });
  }
};
exports.getGuardianList = exports.seeGuardian;

/**
 * Function 114: deleteGuardian
 * PHP: delete_guardian
 * Route: GET /api/delete-guardian
 */
exports.deleteGuardian = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { rememberToken: token },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const guardianId = req.query.guardian_id || req.query.id;
    if (!guardianId) {
      return res.status(400).json({
        message: "Guardian ID not provided",
      });
    }

    const guardian = await Guardian.findOne({
      _id: guardianId,
      user_id: user._id,
    });

    if (!guardian) {
      return res.status(404).json({
        message: "Guardian not found",
      });
    }

    // Get user's first added guardian
    const firstGuardian = await Guardian.findOne({ user_id: user._id }).sort({
      createdAt: 1,
      _id: 1,
    });

    // Check if deleting first guardian
    if (firstGuardian && String(firstGuardian._id) === String(guardian._id)) {
      return res.status(400).json({
        message: "You cannot delete your first added guardian",
      });
    }

    await Guardian.deleteOne({ _id: guardian._id });

    return res.status(200).json({
      message: "Guardian deleted successfully",
    });
  } catch (ex) {
    console.error("deleteGuardian error:", ex);
    return res.status(500).json({
      message: "Server Error",
      details: ex.message,
    });
  }
};

/**
 * Function 115: seeGuardianStatus
 * PHP: see_guardian_status
 * Route: GET /api/see-guardian-status
 */
exports.seeGuardianStatus = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { rememberToken: token },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    let status = user.guardian_status !== undefined ? user.guardian_status : user.guardianStatus;
    if (status === undefined || status === null) {
      status = "0";
    }

    if (String(status) === "2") {
      const updatedAt = user.updatedAt ? new Date(user.updatedAt) : new Date();
      const now = new Date();
      const diffInHours = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

      if (diffInHours >= 24) {
        user.guardian_status = "0";
        user.guardianStatus = "0";
        await user.save();
        status = "0";
      }
    }

    return res.status(200).json({
      message: "Status retrieved successfully",
      guardian_status: status,
    });
  } catch (ex) {
    console.error("seeGuardianStatus error:", ex);
    return res.status(500).json({
      message: "Server Error",
      details: ex.message,
    });
  }
};
exports.getGuardianStatus = exports.seeGuardianStatus;

/**
 * Function 116: addGuardianLater
 * PHP: add_guardian_later
 * Route: ALL /api/add-guardian-later
 */
exports.addGuardianLater = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { rememberToken: token },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    user.guardian_status = "2";
    user.guardianStatus = "2";
    user.updatedAt = new Date();
    await user.save();

    return res.status(200).json({
      message: "Later Add Guardian",
    });
  } catch (ex) {
    console.error("addGuardianLater error:", ex);
    return res.status(500).json({
      message: "Server Error",
      details: ex.message,
    });
  }
};

/**
 * Function 117: getStates
 * PHP: get_state
 * Route: ALL /api/get-state
 */
exports.getStates = async (req, res) => {
  try {
    const states = await State.getIndianStatesList();
    return res.status(200).json({
      message: "Countries retrieved successfully",
      details: states,
    });
  } catch (e) {
    console.error("getStates error:", e);
    return res.status(500).json({
      message: "Failed to retrieve countries",
      error: e.message,
    });
  }
};
exports.getState = exports.getStates;

/**
 * Route: ALL /api/test-login-user
 */
exports.userTestLogin = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Invalid Method",
    });
  }

  const number = req.body?.number;
  if (!number || String(number).trim() === "") {
    return res.status(400).json({
      message: "NUMBER_REQ",
    });
  }

  try {
    const cleanNum = String(number).trim();
    const user = await User.findOne({
      $or: [
        { number: cleanNum },
        { mobile: cleanNum },
        { phone: cleanNum },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    user.token = token;
    user.active_status = 1;
    if (req.body?.reg_id) user.reg_id = req.body.reg_id;
    await user.save();

    return res.status(200).json({
      message: "OTP VERIFIED SUCCESSFULLY",
      token: token || "0",
      register: user.isRegistered ? 1 : user.register || 0,
    });
  } catch (ex) {
    console.error("Error in testLoginUser:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};
exports.testLoginUser = exports.userTestLogin;

/**
 * Function 124: userAppWorkOrNot
 * PHP: userAppWorkOrNot
 * Route: ALL /api/user-app-work-or-not
 */
exports.userAppWorkOrNot = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    let userApp = await UserApp.findOne();
    if (!userApp) {
      userApp = await UserApp.create({ status: 1 });
    }

    // Toggle status (0 -> 1 , 1 -> 0)
    userApp.status = userApp.status === 0 ? 1 : 0;
    await userApp.save();

    const statusText = userApp.status === 1 ? "active" : "inactive";

    return res.status(200).json({
      message: "Status updated successfully",
      status: statusText,
      data: {
        status: userApp.status,
      },
    });
  } catch (ex) {
    console.error("Error in userAppWorkOrNot:", ex);
    return res.status(500).json({
      message: "An error occurred",
    });
  }
};

/**
 * Function 126: deleteUserAccount (Simulated Safe Account Deletion for Play Store & App Store Compliance)
 * PHP: deleteAccount
 * Route: ALL /api/delete-user-account
 */
exports.deleteUserAccount = async (req, res) => {
  try {
    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { rememberToken: token },
      ],
    });

    if (!user) {
      return res.status(404).json({
        message: "Invalid User token",
      });
    }

    // All image/document fields
    const files = [
      user.image,
      user.aadhaar_front_image,
      user.aadhaar_back_image,
      user.aadhaarFront,
      user.aadhaarBack,
    ];

    for (const file of files) {
      if (file && typeof file === "string" && !file.startsWith("http://") && !file.startsWith("https://")) {
        try {
          let clean = file.replace(/\\/g, "/");
          if (clean.startsWith("/")) clean = clean.substring(1);
          const fullPath = path.resolve(__dirname, "../../", clean);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (e) {
          // ignore file unlink errors
        }
      }
    }

    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (e) {
    console.error("deleteUserAccount error:", e);
    return res.status(500).json({
      message: "Server error",
      error: e.message,
    });
  }
};
exports.deleteAccount = exports.deleteUserAccount;

/**
 * User Account Deleted
 * Route: ALL /api/user-account-deleted, /api/user-account-delete, /api/user-delete-account
 */
exports.userAccountDeleted = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (e) {
    console.error("userAccountDeleted error:", e);
    return res.status(500).json({
      message: "Server error",
      error: e.message,
    });
  }
};
exports.userAccountDelete = exports.userAccountDeleted;






