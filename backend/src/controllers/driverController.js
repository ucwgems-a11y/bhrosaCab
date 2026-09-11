/**
 * Driver Controller
 * Handles driver registration, authentication, profile, wallet, and admin management.
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");
const DriverWalletRecharge = require("../models/DriverWalletRecharge");
const DriverTopup = require("../models/DriverTopup");
const DriverCommisionReferBy = require("../models/DriverCommisionReferBy");
const Ride = require("../models/Ride");
const User = require("../models/User");
const CarType = require("../models/CarType");
const PriceFare = require("../models/PriceFare");
const DriverVehicleDetail = require("../models/DriverVehicleDetail");
const CarBooking = require("../models/CarBooking");
const SendLocation = require("../models/SendLocation");
const AppSetting = require("../models/AppSetting");
const DriverCheckBooking = require("../models/DriverCheckBooking");
const UserWalletRecharge = require("../models/UserWalletRecharge");
const CancelReason = require("../models/CancelReason");
const SubAdmin = require("../models/SubAdmin");
const SubAdminCommission = require("../models/SubAdminCommission");
const Bank = require("../models/Bank");
const DriverAccount = require("../models/DriverAccount");
const DriverWithdrawRequest = require("../models/DriverWithdrawRequest");
const fcmService = require("../services/fcmService");

// Helper function to format clean URL for uploaded images
const formatImageUrl = (imgPath, req) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://"))
    return imgPath;
  let cleanPath = imgPath.replace(/\\/g, "/");
  if (cleanPath.includes("uploads/")) {
    cleanPath = cleanPath.substring(cleanPath.indexOf("uploads/"));
  }
  const host =
    req && typeof req.get === "function"
      ? req.get("host")
      : (req && req.headers && req.headers.host) || "localhost:5000";
  const protocol = req && req.protocol ? req.protocol : "http";
  return `${protocol}://${host}/${cleanPath}`;
};

// Map numeric status to human readable label
const getStatusLabel = (status) => {
  if (status === 2 || status === "2") return "Approved";
  if (status === 3 || status === "3") return "Rejected";
  return "Pending"; // default for 0, 1, or null
};

// Calculate dynamic time-based statistics from DB
async function calculateDynamicStats() {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0,
  );

  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
    0,
    0,
    0,
    0,
  );
  const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

  const total = await Driver.countDocuments();
  const today = await Driver.countDocuments({
    $or: [
      { created_at: { $gte: startOfToday } },
      { createdAt: { $gte: startOfToday } },
    ],
  });
  const thisWeek = await Driver.countDocuments({
    $or: [
      { created_at: { $gte: startOfWeek } },
      { createdAt: { $gte: startOfWeek } },
    ],
  });
  const thisMonth = await Driver.countDocuments({
    $or: [
      { created_at: { $gte: startOfMonth } },
      { createdAt: { $gte: startOfMonth } },
    ],
  });
  const thisYear = await Driver.countDocuments({
    $or: [
      { created_at: { $gte: startOfYear } },
      { createdAt: { $gte: startOfYear } },
    ],
  });

  const todayNC = await Driver.countDocuments({
    status: { $ne: 2 },
    $or: [
      { created_at: { $gte: startOfToday } },
      { createdAt: { $gte: startOfToday } },
    ],
  });
  const totalNC = await Driver.countDocuments({
    status: { $ne: 2 },
  });

  const approved = await Driver.countDocuments({ status: 2 });
  const pending = await Driver.countDocuments({
    $or: [{ status: 1 }, { status: 0 }, { status: null }],
  });
  const rejected = await Driver.countDocuments({ status: 3 });
  const active = await Driver.countDocuments({ active_status: 1 });
  const blocked = await Driver.countDocuments({ block_status: 1 });

  return {
    total,
    today,
    thisWeek,
    thisMonth,
    thisYear,
    todayNC,
    totalNC,
    approved,
    pending,
    rejected,
    active,
    blocked,
  };
}

/* =========================================================================
   1. DRIVER MOBILE APP AUTH & PROFILE APIS
   ========================================================================= */

// @desc    Driver Registration / Login Request (Send OTP)
// @route   POST /api/driver-register  OR  POST /api/drivers/register
exports.driverRegister = async (req, res) => {
  try {
    const body = req.body || {};
    const number = body.number || req?.query?.number;
    if (!number || typeof number !== "string" || number.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const cleanNumber = number.trim();
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    let driver = await Driver.findOne({
      $or: [
        { number: cleanNumber },
        { number: cleanNumber.replace("+91", "") },
      ],
    });

    let accountExit = 0;

    if (!driver) {
      driver = await Driver.create({
        number: cleanNumber,
        otp: otp,
        status: 0,
        active_status: 0,
        block_status: 0,
        wallet: 0,
        register: 0,
      });
      accountExit = 0;
    } else {
      if (driver.block_status === 1) {
        return res.status(403).json({
          success: false,
          message:
            "Your driver account has been blocked. Please contact support.",
        });
      }

      driver.otp = otp;
      await driver.save();
      accountExit = driver.name && driver.name.trim().length > 0 ? 1 : 0;
    }

    const message = `Welcome to Bhrosa Cab! Your login verification code is ${otp}. Enter this OTP to continue your Application Login. For your security, never share this code. Thanks Bhrosa Group`;

    // SMS Gateway integration
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

      const smsRes = await fetch(url.toString(), {
        method: "GET",
        signal: AbortSignal.timeout(10000),
      });
      gatewayResponse = await smsRes.text();
    } catch (smsErr) {
      console.warn("SMS Gateway warning:", smsErr.message);
      gatewayResponse = "GATEWAY_TIMEOUT_OR_SIMULATED";
    }

    return res.status(200).json({
      status: true,
      success: true,
      message: "OTP has been sent successfully",
      account_exit: accountExit,
      otp: otp,
      gateway_response: gatewayResponse,
    });
  } catch (error) {
    console.error("driverRegister Error:", error);
    return res.status(500).json({
      status: false,
      success: false,
      message: "Error occurred",
      details: error.message,
    });
  }
};

// @desc    Driver OTP Verify & Login Token
// @route   POST /api/driver-otp-verify  OR  POST /api/drivers/verify-otp
exports.driverOtpVerifyLogin = async (req, res) => {
  try {
    const body = req.body || {};
    const number = body.number || req?.query?.number;
    const otp = body.otp || req?.query?.otp;
    const reg_id = body.reg_id || req?.query?.reg_id;

    if (!number || !otp) {
      return res.status(400).json({
        message: "NUMBER_AND_OTP_REQ",
      });
    }

    const cleanNumber = number.toString().trim();
    const cleanOtp = otp.toString().trim();

    const driver = await Driver.findOne({
      $or: [
        { number: cleanNumber },
        { number: cleanNumber.replace("+91", "") },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver Not Found",
      });
    }

    if (driver.otp !== cleanOtp) {
      return res.status(401).json({
        message: "INVALID_OTP",
        token: "0",
      });
    }

    const token = jwt.sign(
      {
        id: driver._id,
        number: driver.number,
        role: "driver",
      },
      process.env.JWT_SECRET || "bhrosacab_secret_key_2026_8409586058",
      { expiresIn: "365d" },
    );

    driver.otp = null;
    driver.token = token;
    if (reg_id) {
      driver.reg_id = reg_id;
    }
    await driver.save();

    return res.status(200).json({
      status: true,
      message: "OTP VERIFIED SUCCESSFULLY",
      token: token,
      register: driver.register || 0,
      approval_status: driver.status,
      active_status: driver.active_status,
      driver_id: driver._id,
    });
  } catch (error) {
    console.error("driverOtpVerifyLogin Error:", error);
    return res.status(500).json({
      status: false,
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    Register Driver by Mobile Number & Send OTP (PHP: ApiController::onehundredOne)
// @route   POST /api/number-register-driver
exports.numberRegisterDriver = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const number = req.body?.number || req.query?.number;
    const referalCode = req.body?.referalCode || req.query?.referalCode || null;

    if (!number || String(number).trim() === "") {
      return res.status(422).json({
        message: "Invalid mobile number",
      });
    }

    const cleanNumber = String(number).trim();

    if (referalCode && String(referalCode).trim() !== "") {
      const checkReferalCode = await Driver.findOne({
        referalCode: String(referalCode).trim(),
        status: { $in: [2, "2"] },
      });

      if (!checkReferalCode) {
        return res.status(422).json({
          message: "Invalid referal code",
        });
      }
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    const check = await Driver.findOne({
      $or: [
        { number: cleanNumber },
        { number: cleanNumber.replace("+91", "") },
      ],
    });

    if (!check) {
      await Driver.create({
        number: cleanNumber,
        otp: String(otp),
        referByCode: referalCode,
        status: 0,
        active_status: 0,
        block_status: 0,
        wallet: 0,
        register: 0,
      });
    } else {
      if (check.block_status === 1 || String(check.block_status) === "1") {
        return res.status(403).json({
          success: false,
          message: "Your account has been blocked. Please contact customer support.",
        });
      }

      check.otp = String(otp);
      if (referalCode) check.referByCode = referalCode;
      await check.save();
    }

    const message = `Your Bhrosa Cabs Driver Login OTP is ${otp}. Please do not share this OTP with anyone. It is valid for a limited time. Thanks Bhrosa Group`;

    let gatewayResponse = "";
    try {
      const url = new URL("https://msg.vadvertiseweb.com/submitsms.jsp");
      url.searchParams.append("user", "Bhrosa");
      url.searchParams.append("key", process.env.SMS_API_KEY || "a1461568f5XX");
      url.searchParams.append("mobile", cleanNumber.replace("+91", ""));
      url.searchParams.append("message", message);
      url.searchParams.append("senderid", "BHRGRP");
      url.searchParams.append("accusage", "1");

      const response = await fetch(url.toString(), {
        method: "GET",
        signal: AbortSignal.timeout(15000),
      });
      gatewayResponse = await response.text();
    } catch (smsErr) {
      console.warn("SMS send warning in numberRegisterDriver:", smsErr.message);
      gatewayResponse = smsErr.message;
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      gateway_response: gatewayResponse,
    });
  } catch (ex) {
    return res.status(500).json({
      success: false,
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    Verify Driver OTP & Generate Token (PHP: ApiController::onehundredTwo)
// @route   POST /api/number-verify-driver
exports.numberVerifyDriver = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Invalid Method",
    });
  }

  const number = req.body?.number || req.query?.number;
  const otp = req.body?.otp || req.query?.otp;

  if (!number || !otp) {
    return res.status(400).json({
      message: "NUMBER_AND_OTP_REQ",
    });
  }

  try {
    const cleanNumber = String(number).trim();
    const cleanOtp = String(otp).trim();

    const driver = await Driver.findOne({
      $or: [
        { number: cleanNumber },
        { number: cleanNumber.replace("+91", "") },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    if (driver.block_status === 1 || String(driver.block_status) === "1") {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    if (String(driver.otp) !== cleanOtp) {
      return res.status(200).json({
        success: false,
        message: "INVALID_OTP",
        token: "0",
      });
    }

    const reg_id = req.body?.reg_id || req.query?.reg_id;
    driver.otp = null;
    driver.active_status = "0";
    if (reg_id) {
      driver.reg_id = reg_id;
    }

    const token = jwt.sign(
      {
        id: driver._id,
        number: driver.number,
        role: "driver",
      },
      process.env.JWT_SECRET || "bhrosacab_secret_key_2026_8409586058",
      { expiresIn: "365d" }
    );

    driver.token = token;
    driver.appToken = token;
    await driver.save();

    return res.status(200).json({
      message: "OTP VERIFIED SUCCESSFULLY",
      token: token,
      driver_id: driver.mysqlId || driver._id,
      register: driver.register ?? 0,
      active_status: driver.active_status ?? "0",
      status: driver.status ?? 0,
      block_status: driver.block_status ?? 0,
    });
  } catch (ex) {
    console.error("Error in OTP verification:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: "Please contact support.",
    });
  }
};

// @desc    Driver Complete Profile (PHP: ApiController::seventeen)
// @route   POST /api/complete-profile-driver
exports.completeProfileDriver = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const body = req.body || {};

    // Process file uploads if any
    const fileMap = {};
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        fileMap[file.fieldname] = `uploads/drivers/${file.filename}`;
      }
    }

    // Auto-generate Unique Referral Code if not already present
    if (!driver.referalCode) {
      const candidateName = body.name || driver.name || "BC";
      const cleanName = (
        candidateName.replace(/[^a-zA-Z]/g, "") || "BC"
      ).toLowerCase();
      let prefix = cleanName.substring(0, 2);
      if (prefix.length < 2) prefix = prefix.padEnd(2, "b");
      let code = "";
      let exists = true;
      while (exists) {
        const randNum = Math.floor(10000 + Math.random() * 90000);
        code = `${prefix}${randNum}`;
        const found = await Driver.findOne({ referalCode: code });
        if (!found) exists = false;
      }
      driver.referalCode = code;
    }

    // Update driver fields
    if (body.name !== undefined) driver.name = body.name;
    if (body.last_name !== undefined) driver.last_name = body.last_name;
    if (body.email !== undefined) driver.email = body.email;
    if (body.gender !== undefined) driver.gender = body.gender;
    if (body.dob !== undefined) driver.dob = body.dob;
    if (body.state !== undefined) driver.state = body.state;
    if (body.address !== undefined) driver.address = body.address;
    if (body.cateogory !== undefined) driver.cateogory = body.cateogory;
    else if (body.category !== undefined) driver.cateogory = body.category;
    if (body.brand !== undefined) driver.brand = body.brand;
    if (body.model !== undefined) driver.model = body.model;
    if (body.color !== undefined) driver.color = body.color;
    if (body.vehicle_number !== undefined)
      driver.vehicle_number = body.vehicle_number;
    if (body.manufacturing_year !== undefined)
      driver.manufacturing_year = body.manufacturing_year;
    if (body.license_number !== undefined)
      driver.license_number = body.license_number;
    if (body.aadhaar_number !== undefined)
      driver.aadhaar_number = body.aadhaar_number;

    // Document and photo fields (from fileMap or body fallback)
    const image = fileMap.image || body.image;
    if (image) driver.image = image;

    const dlFront =
      fileMap.driving_licence_front ||
      fileMap.driving_license_front ||
      body.driving_licence_front ||
      body.driving_license_front;
    if (dlFront) driver.driving_licence_front = dlFront;

    const dlBack =
      fileMap.driving_licence_back ||
      fileMap.driving_license_back ||
      body.driving_licence_back ||
      body.driving_license_back;
    if (dlBack) driver.driving_licence_back = dlBack;

    const vRcFront = fileMap.vehicle_rc_front || body.vehicle_rc_front;
    if (vRcFront) driver.vehicle_rc_front = vRcFront;

    const vRcBack = fileMap.vehicle_rc_back || body.vehicle_rc_back;
    if (vRcBack) driver.vehicle_rc_back = vRcBack;

    const vFront = fileMap.vehicle_front_image || body.vehicle_front_image;
    if (vFront) driver.vehicle_front_image = vFront;

    const vBack = fileMap.vehicle_back_image || body.vehicle_back_image;
    if (vBack) driver.vehicle_back_image = vBack;

    const vInterior =
      fileMap.vehicle_interior_image || body.vehicle_interior_image;
    if (vInterior) driver.vehicle_interior_image = vInterior;

    const insFront =
      fileMap.insurence_front ||
      fileMap.insurance_front ||
      body.insurence_front ||
      body.insurance_front;
    if (insFront) driver.insurence_front = insFront;

    const insBack =
      fileMap.insurence_back ||
      fileMap.insurance_back ||
      body.insurence_back ||
      body.insurance_back;
    if (insBack) driver.insurence_back = insBack;

    const idFront = fileMap.id_proof_front || body.id_proof_front;
    if (idFront) driver.id_proof_front = idFront;

    const idBack = fileMap.id_proof_back || body.id_proof_back;
    if (idBack) driver.id_proof_back = idBack;

    const govtId = fileMap.government_id_proof || body.government_id_proof;
    if (govtId) driver.government_id_proof = govtId;

    // Transition status
    driver.register = 1;
    driver.status = 1;

    await driver.save();

    return res.status(200).json({
      message: "Updated Successfully",
      referalCode: driver.referalCode,
    });
  } catch (error) {
    console.error("completeProfileDriver Error:", error);
    return res.status(400).json({
      message: "No changes made or Technical Error",
    });
  }
};

// @desc    Get Driver Profile (PHP: ApiController::eighteen)
// @route   GET /api/get-profile-driver
exports.getProfileDriver = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const driverObj = driver.toObject ? driver.toObject() : { ...driver };
    driverObj.id = String(driverObj._id || driverObj.id);

    // Country code & phone without country code formatting
    let numStr = String(driverObj.number || "");
    let countryCode = driverObj.country_code || "+91";
    let numberWithoutCC = numStr;
    if (numStr.startsWith("+91")) {
      countryCode = "+91";
      numberWithoutCC = numStr.substring(3);
    } else if (numStr.startsWith("91") && numStr.length > 10) {
      countryCode = "+91";
      numberWithoutCC = numStr.substring(2);
    }
    driverObj.country_code = countryCode;
    driverObj.number_without_country_code = numberWithoutCC;

    // Format all document and image URLs
    const imgKeys = [
      "image",
      "driving_licence_front",
      "driving_licence_back",
      "vehicle_rc_front",
      "vehicle_rc_back",
      "vehicle_front_image",
      "vehicle_back_image",
      "vehicle_interior_image",
      "insurence_front",
      "insurence_back",
      "government_id_proof",
      "id_proof_front",
      "id_proof_back",
    ];
    for (const key of imgKeys) {
      if (driverObj[key]) {
        driverObj[key] = formatImageUrl(driverObj[key], req);
      }
    }

    // Driver rating calculation
    let avgRating = "0";
    try {
      const db = mongoose.connection.db;
      const ratings = await db
        .collection("driver_ratings")
        .find({
          $or: [{ driver_id: driver._id }, { driver_id: String(driver._id) }],
        })
        .toArray();

      if (ratings && ratings.length > 0) {
        const sum = ratings.reduce(
          (acc, r) => acc + (Number(r.rating) || 0),
          0
        );
        avgRating = (sum / ratings.length).toFixed(1);
      } else if (driverObj.rating) {
        avgRating = String(driverObj.rating);
      }
    } catch (e) {
      if (driverObj.rating) avgRating = String(driverObj.rating);
    }
    driverObj.rating = avgRating;

    // Price fare lookup by vehicle category
    let farePerKm = null;
    let farePerKmTo = null;
    if (driverObj.cateogory) {
      const fareConditions = [];
      if (!isNaN(driverObj.cateogory)) {
        fareConditions.push({ vehicleType: Number(driverObj.cateogory) });
      }
      if (mongoose.isValidObjectId(driverObj.cateogory)) {
        fareConditions.push({ carType: driverObj.cateogory });
      }
      if (fareConditions.length > 0) {
        const fare = await PriceFare.findOne({ $or: fareConditions });
        if (fare) {
          farePerKm = fare.farePerKm || null;
          farePerKmTo = fare.farePerKmTo || null;
        }
      }
    }
    driverObj.fare_per_km = farePerKm;
    driverObj.fare_per_km_to = farePerKmTo;

    return res.status(200).json({
      message: "Profile Get Successfully",
      details: [driverObj],
    });
  } catch (error) {
    console.error("getProfileDriver Error:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      details: error.message,
    });
  }
};

// @desc    Edit Driver Profile (PHP: ApiController::nineteen)
// @route   POST /api/edit-profile-driver
exports.editProfileDriver = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    // Process image file upload
    let imagePath = null;
    if (req.files && Array.isArray(req.files)) {
      const imgFile = req.files.find((f) => f.fieldname === "image");
      if (imgFile) {
        imagePath = `uploads/drivers/${imgFile.filename}`;
      }
    } else if (req.file && req.file.fieldname === "image") {
      imagePath = `uploads/drivers/${req.file.filename}`;
    }

    // Clean up old local image if new image was uploaded
    if (imagePath && driver.image && !driver.image.startsWith("http")) {
      try {
        const oldPath = path.join(__dirname, "../../", driver.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (e) {
        // Silently ignore unlink error
      }
    }

    if (req.body.name !== undefined) driver.name = req.body.name;
    if (req.body.last_name !== undefined) driver.last_name = req.body.last_name;
    if (req.body.number !== undefined) driver.number = req.body.number;
    if (imagePath) driver.image = imagePath;
    else if (req.body.image !== undefined) driver.image = req.body.image;

    await driver.save();

    return res.status(200).json({
      success: true,
      message: "Driver profile updated successfully.",
    });
  } catch (ex) {
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    Get Driver Status (PHP: ApiController::twentyone)
// @route   GET /api/get-driver-status
exports.getDriverStatus = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const details = {
      id: String(driver._id || driver.id),
      status: driver.status !== undefined ? Number(driver.status) : 0,
      block_status:
        driver.block_status !== undefined ? Number(driver.block_status) : 0,
      document_verify_status: driver.document_verify_status || "0",
      screen_title:
        driver.screen_title ||
        "Thank you for choosing BhrosaCab. Your application is currently under review, and we will notify you once there is an update.",
      screen_description:
        driver.screen_description ||
        "If you have any queries regarding your application, please feel free to contact us. Our customer support team will be glad to assist you.",
      customer_care_number: driver.customer_care_number || "9115513232",
    };

    return res.status(200).json({
      message: " Driver Status Get Successfully",
      details: [details],
    });
  } catch (ex) {
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 111: getDocumentVerificationStatus
 * PHP: eightyFour
 * Route: GET /api/get-document-verification-status
 */
exports.getDocumentVerificationStatus = exports.getDriverStatus;


// @desc    Driver Online/Offline Toggle with Location (PHP: ApiController::twentyfour)
// @route   POST /api/driver-online-offline
exports.driverOnlineOffline = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const newStatus = driver.active_status == 1 ? 0 : 1;
    driver.active_status = newStatus;

    const latitude = req.body?.latitude || req.query?.latitude || null;
    const longitude = req.body?.longitude || req.query?.longitude || null;

    if (newStatus == 1) {
      driver.latitude = latitude ? String(latitude) : null;
      driver.longitude = longitude ? String(longitude) : null;
    } else {
      driver.latitude = null;
      driver.longitude = null;
    }

    await driver.save();

    return res.status(200).json({
      message:
        newStatus == 1
          ? "Driver online successfully"
          : "Driver offline successfully",
      active_status: newStatus,
      latitude: newStatus == 1 ? (latitude ? String(latitude) : null) : null,
      longitude:
        newStatus == 1 ? (longitude ? String(longitude) : null) : null,
    });
  } catch (ex) {
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    Driver Vehicle Detail Save (PHP: ApiController::twentyfive)
// @route   POST /api/driver-vehicle-detail
exports.driverVehicleDetail = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    let vehicleImage = null;
    if (req.files && Array.isArray(req.files)) {
      const vFile = req.files.find((f) => f.fieldname === "vehicle_image");
      if (vFile) {
        vehicleImage = `uploads/drivers/${vFile.filename}`;
      }
    } else if (req.file && req.file.fieldname === "vehicle_image") {
      vehicleImage = `uploads/drivers/${req.file.filename}`;
    }

    if (!vehicleImage && req.body.vehicle_image) {
      vehicleImage = req.body.vehicle_image;
    }

    const save = await DriverVehicleDetail.create({
      driver_id: driver._id,
      vehicle_number: req.body.vehicle_number || req.query.vehicle_number,
      vehicle_type: req.body.vehicle_type || req.query.vehicle_type,
      vehicle_name: req.body.vehicle_name || req.query.vehicle_name,
      vehicle_rc: null,
      vehicle_image: vehicleImage,
      vehicle_model: req.body.vehicle_model || req.query.vehicle_model,
    });

    if (save) {
      return res.status(200).json({
        message: "Driver Vehicle Detail saved successfully",
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

// @desc    Get Driver Vehicle Details (PHP: ApiController::twentySeven)
// @route   GET /api/get-vehicle-details
exports.getVehicleDetails = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const vehicles = await DriverVehicleDetail.find({
      $or: [{ driver_id: driver._id }, { driver_id: String(driver._id) }],
    }).lean();

    if (vehicles && vehicles.length > 0) {
      const details = vehicles.map((v) => {
        let vehicleTypeLabel = "Unknown Vehicle Type";
        const vType = Number(v.vehicle_type);
        switch (vType) {
          case 1:
            vehicleTypeLabel = "Mini";
            break;
          case 2:
            vehicleTypeLabel = "Prime Sedan";
            break;
          case 3:
            vehicleTypeLabel = "Premium SUV";
            break;
          case 4:
            vehicleTypeLabel = "Premium Plus";
            break;
          default:
            vehicleTypeLabel = v.vehicle_type || "Unknown Vehicle Type";
            break;
        }

        return {
          id: String(v._id || v.id),
          vehicle_number: v.vehicle_number || null,
          vehicle_type: vehicleTypeLabel,
          vehicle_name: v.vehicle_name || null,
          vehicle_model: v.vehicle_model || null,
          vehicle_image: v.vehicle_image
            ? formatImageUrl(v.vehicle_image, req)
            : null,
        };
      });

      return res.status(200).json({
        message: "Driver Vehicle Details",
        details,
      });
    } else {
      return res.status(400).json({
        message: "No found or Technical Error",
      });
    }
  } catch (ex) {
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    Get Specific Vehicle Type Detail (PHP: ApiController::twentyEight)
// @route   GET /api/get-vehicle-type-detail
exports.getVehicleTypeDetail = async (req, res) => {
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

    const driver = await Driver.findOne({ token });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const targetId = req.query.id || req.body?.id;
    let query = {};
    if (targetId && mongoose.isValidObjectId(targetId)) {
      query._id = targetId;
    } else if (targetId) {
      query.$or = [{ _id: targetId }, { id: targetId }];
    } else {
      query.driver_id = driver._id;
    }

    const get = await DriverVehicleDetail.find(query).lean();

    if (get && get.length > 0) {
      const details = get.map((v) => ({
        id: String(v._id || v.id),
        vehicle_number: v.vehicle_number || null,
        vehicle_type: v.vehicle_type || null,
        vehicle_name: v.vehicle_name || null,
        vehicle_image: v.vehicle_image
          ? formatImageUrl(v.vehicle_image, req)
          : null,
        vehicle_rc: v.vehicle_rc ? formatImageUrl(v.vehicle_rc, req) : null,
      }));

      return res.status(200).json({
        message: "Driver Vehicle Details",
        details,
      });
    } else {
      return res.status(400).json({
        message: "No found or Technical Error",
      });
    }
  } catch (ex) {
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// @desc    Driver Active (Online/Offline) Status Toggle
// @route   POST /api/driver-active-status  OR  POST /api/drivers/active-status
exports.driverActiveStatus = async (req, res) => {
  try {
    const driver = req.driver;
    const body = req.body || {};
    const active_status =
      body.active_status !== undefined
        ? body.active_status
        : req?.query?.active_status;

    if (active_status !== undefined) {
      driver.active_status = Number(active_status);
    } else {
      driver.active_status = driver.active_status === 1 ? 0 : 1;
    }

    await driver.save();

    return res.status(200).json({
      status: true,
      message:
        driver.active_status === 1
          ? "Driver is now Online"
          : "Driver is now Offline",
      active_status: driver.active_status,
    });
  } catch (error) {
    console.error("driverActiveStatus Error:", error);
    return res.status(500).json({
      status: false,
      message: "Error",
      details: error.message,
    });
  }
};

// @desc    Driver GPS Lat/Lng Location Update (Real-time tracking)
// @route   POST /api/driver-lat-lng-update  OR  POST /api/drivers/lat-lng-update
exports.driverLatLngUpdate = async (req, res) => {
  try {
    const driver = req.driver;
    const body = req.body || {};
    const latitude = body.latitude || req?.query?.latitude;
    const longitude = body.longitude || req?.query?.longitude;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ status: false, message: "Latitude and longitude required" });
    }

    driver.latitude = String(latitude);
    driver.longitude = String(longitude);
    await driver.save();

    return res.status(200).json({
      status: true,
      message: "Driver location updated successfully",
      data: {
        latitude: driver.latitude,
        longitude: driver.longitude,
      },
    });
  } catch (error) {
    console.error("driverLatLngUpdate Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Error", details: error.message });
  }
};

// @desc    Driver Get Profile Details
// @route   GET /api/driver-profile  OR  GET /api/drivers/profile
exports.driverProfile = async (req, res) => {
  try {
    const driver = req.driver;

    const data = {
      id: driver._id,
      name: driver.name,
      last_name: driver.last_name,
      email: driver.email,
      number: driver.number,
      wallet: driver.wallet || 0,
      state: driver.state,
      gender: driver.gender,
      dob: driver.dob,
      address: driver.address,
      vehicle_number: driver.vehicle_number,
      cateogory: driver.cateogory,
      brand: driver.brand,
      model: driver.model,
      color: driver.color,
      license_number: driver.license_number,
      active_status: driver.active_status,
      status: driver.status,
      status_label: getStatusLabel(driver.status),
      block_status: driver.block_status,
      image: formatImageUrl(driver.image, req),
      driving_licence_front: formatImageUrl(driver.driving_licence_front, req),
      driving_licence_back: formatImageUrl(driver.driving_licence_back, req),
      vehicle_rc_front: formatImageUrl(driver.vehicle_rc_front, req),
      vehicle_rc_back: formatImageUrl(driver.vehicle_rc_back, req),
      insurence_front: formatImageUrl(driver.insurence_front, req),
      insurence_back: formatImageUrl(driver.insurence_back, req),
      id_proof_front: formatImageUrl(driver.id_proof_front, req),
      id_proof_back: formatImageUrl(driver.id_proof_back, req),
      vehicle_front_image: formatImageUrl(driver.vehicle_front_image, req),
      vehicle_back_image: formatImageUrl(driver.vehicle_back_image, req),
      vehicle_interior_image: formatImageUrl(
        driver.vehicle_interior_image,
        req,
      ),
      government_id_proof: formatImageUrl(driver.government_id_proof, req),
    };

    return res.status(200).json({
      status: true,
      message: "Driver profile fetched successfully",
      data,
    });
  } catch (error) {
    console.error("driverProfile Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Error", details: error.message });
  }
};

// @desc    Driver Wallet & Transaction History
// @route   GET /api/driver-wallet-history  OR  GET /api/drivers/wallet-history
exports.driverWalletHistory = async (req, res) => {
  try {
    const driver = req.driver;

    const history = await DriverWalletRecharge.find({ driver_id: driver._id })
      .sort({ created_at: -1 })
      .populate("booking_id", "from to totalFare status date");

    return res.status(200).json({
      status: true,
      wallet: driver.wallet || 0,
      data: history,
    });
  } catch (error) {
    console.error("driverWalletHistory Error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Error", details: error.message });
  }
};

/* =========================================================================
   2. ADMIN & CRM PANEL DRIVER MANAGEMENT APIS
   ========================================================================= */

// GET ALL DRIVERS (With search, status filter, pagination)
exports.getDrivers = async (req, res) => {
  try {
    const {
      search,
      status,
      state,
      active_status,
      page = 1,
      limit = 50,
    } = req.query;
    let filter = {};

    if (status !== undefined && status !== "") {
      if (status === "2" || status === 2) {
        filter.status = 2;
      } else if (status === "3" || status === 3) {
        filter.status = 3;
      } else if (status === "1" || status === 1) {
        filter.$or = [{ status: 1 }, { status: 0 }, { status: null }];
      }
    }

    if (state && state.trim()) {
      filter.state = { $regex: state.trim(), $options: "i" };
    }

    if (active_status !== undefined && active_status !== "") {
      filter.active_status = Number(active_status);
    }

    if (search && search.trim()) {
      const q = search.trim();
      const numQ = Number(q);
      const searchConditions = [
        { name: { $regex: q, $options: "i" } },
        { number: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { vehicle_number: { $regex: q, $options: "i" } },
        { license_number: { $regex: q, $options: "i" } },
        { aadhaar_number: { $regex: q, $options: "i" } },
        { state: { $regex: q, $options: "i" } },
      ];
      if (!isNaN(numQ)) {
        searchConditions.push({ driver_id: numQ });
      }
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: searchConditions });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Driver.countDocuments(filter);
    const driversList = await Driver.find(filter)
      .sort({ created_at: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const stats = await calculateDynamicStats();

    // Compute ride counts for the drivers on this page
    const driverObjectIds = driversList.map((d) => d._id);
    const driverNumericIds = driversList
      .map((d) => d.driver_id)
      .filter(Boolean);
    const allDriverSearchIds = [...driverObjectIds, ...driverNumericIds];

    const rideCounts = await Ride.aggregate([
      { $match: { driver_id: { $in: allDriverSearchIds } } },
      { $group: { _id: "$driver_id", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    rideCounts.forEach((rc) => {
      countMap[String(rc._id)] = rc.count;
    });

    const formattedDrivers = driversList.map((d) => ({
      id: d._id.toString(),
      _id: d._id.toString(),
      name: d.name || "N/A",
      lastName: d.last_name || "",
      email: d.email || "N/A",
      phone: d.number || "",
      number: d.number || "",
      wallet: d.wallet || 0,
      totalRides:
        countMap[String(d._id)] ||
        (d.driver_id ? countMap[String(d.driver_id)] : 0) ||
        0,
      state: d.state || "N/A",
      vehicleNumber: d.vehicle_number || "N/A",
      vehicleCategory: d.cateogory || "Hatchback",
      vehicleBrand: d.brand || "",
      vehicleModel: d.model || "",
      vehicleColor: d.color || "",
      licenseNumber: d.license_number || "N/A",
      aadhaarNumber: d.aadhaar_number || "N/A",
      aadhaarStatus: d.aadhaar_number_status || "pending",
      licenceStatus: d.driving_licence_status || "pending",
      image:
        formatImageUrl(d.image, req) ||
        "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(d.name || "Driver"),
      vehicleFront: formatImageUrl(d.vehicle_front_image, req),
      vehicleBack: formatImageUrl(d.vehicle_back_image, req),
      vehicleInterior: formatImageUrl(d.vehicle_interior_image, req),
      licenceFront: formatImageUrl(d.driving_licence_front, req),
      licenceBack: formatImageUrl(d.driving_licence_back, req),
      idProofFront: formatImageUrl(d.id_proof_front, req),
      idProofBack: formatImageUrl(d.id_proof_back, req),
      rcFront: formatImageUrl(d.vehicle_rc_front, req),
      rcBack: formatImageUrl(d.vehicle_rc_back, req),
      govtIdProof: formatImageUrl(d.government_id_proof, req),
      active: d.active_status === 1 ? "Online" : "Offline",
      active_status: d.active_status,
      approved: getStatusLabel(d.status),
      status: getStatusLabel(d.status),
      statusCode: d.status,
      block_status: d.block_status,
      blocked: d.block_status === 1,
      document_verify_status: d.document_verify_status || "0",
      created_at: d.created_at || d.createdAt,
    }));

    return res.status(200).json({
      success: true,
      total,
      count: formattedDrivers.length,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      drivers: formattedDrivers,
      stats,
    });
  } catch (err) {
    console.error("Error in getDrivers:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET DRIVER STATS
exports.getDriverStats = async (req, res) => {
  try {
    const stats = await calculateDynamicStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET ACTIVE DRIVERS BY STATE AGGREGATION (ONLY ONLINE / ACTIVE_STATUS: 1 DRIVERS)
exports.getActiveDriversStateCount = async (req, res) => {
  try {
    const { search } = req.query;
    let match = { active_status: 1, state: { $ne: null, $nin: ["", "N/A"] } };

    if (search && search.trim()) {
      match.state = { $regex: search.trim(), $options: "i" };
    }

    const stateCounts = await Driver.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$state",
          count: { $sum: 1 },
          activeCount: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const totalActive = await Driver.countDocuments({ active_status: 1 });
    const formatted = stateCounts.map((s, idx) => ({
      id: idx + 1,
      state: s._id,
      count: s.count,
      activeCount: s.activeCount,
    }));

    return res.status(200).json({
      success: true,
      totalActive,
      stateCounts: formatted,
    });
  } catch (err) {
    console.error("Error in getActiveDriversStateCount:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET SINGLE DRIVER BY ID
exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;
    let driver = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }
    if (!driver) {
      driver = await Driver.findOne({ number: id });
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const docObj = { ...driver._doc };
    delete docObj.driver_id;

    const data = {
      ...docObj,
      id: driver._id.toString(),
      _id: driver._id.toString(),
      image:
        formatImageUrl(driver.image, req) ||
        "https://ui-avatars.com/api/?name=" +
          encodeURIComponent(driver.name || "Driver"),
      vehicleFront: formatImageUrl(driver.vehicle_front_image, req),
      vehicleBack: formatImageUrl(driver.vehicle_back_image, req),
      vehicleInterior: formatImageUrl(driver.vehicle_interior_image, req),
      licenceFront: formatImageUrl(driver.driving_licence_front, req),
      licenceBack: formatImageUrl(driver.driving_licence_back, req),
      insuranceFront: formatImageUrl(driver.insurence_front, req),
      insuranceBack: formatImageUrl(driver.insurence_back, req),
      idProofFront: formatImageUrl(driver.id_proof_front, req),
      idProofBack: formatImageUrl(driver.id_proof_back, req),
      rcFront: formatImageUrl(driver.vehicle_rc_front, req),
      rcBack: formatImageUrl(driver.vehicle_rc_back, req),
      govtIdProof: formatImageUrl(driver.government_id_proof, req),
      aadhaarStatus: driver.aadhaar_number_status || "pending",
      licenceStatus: driver.driving_licence_status || "pending",
      statusLabel: getStatusLabel(driver.status),
      isPending: driver.status !== 2 && driver.status !== 3,
      isApproved: driver.status === 2,
      isRejected: driver.status === 3,
    };

    return res.status(200).json({
      success: true,
      data,
      driver: data,
    });
  } catch (err) {
    console.error("Error in getDriverById:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE DRIVER STATUS
exports.updateDriverStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      document_verify_status,
      driving_licence_status,
      aadhaar_number_status,
    } = req.body;

    let driver = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    let numericStatus = driver.status;
    if (
      status === 2 ||
      status === "2" ||
      status === "Approved" ||
      status === "approve" ||
      status === "accepted"
    ) {
      numericStatus = 2;
      driver.document_verify_status = "accepted";
    } else if (
      status === 3 ||
      status === "3" ||
      status === "Rejected" ||
      status === "reject" ||
      status === "rejected"
    ) {
      numericStatus = 3;
      driver.document_verify_status = "rejected";
    } else if (
      status === 1 ||
      status === "1" ||
      status === "Pending" ||
      status === "pending"
    ) {
      numericStatus = 1;
      driver.document_verify_status = "pending";
    }

    driver.status = numericStatus;
    if (document_verify_status)
      driver.document_verify_status = document_verify_status;
    if (driving_licence_status !== undefined)
      driver.driving_licence_status = driving_licence_status;
    if (aadhaar_number_status !== undefined)
      driver.aadhaar_number_status = aadhaar_number_status;

    await driver.save();

    return res.status(200).json({
      success: true,
      message: `Driver status updated to '${getStatusLabel(numericStatus)}' successfully`,
      status: getStatusLabel(numericStatus),
      statusCode: numericStatus,
      driver,
    });
  } catch (err) {
    console.error("Error in updateDriverStatus:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// TOGGLE DRIVER BLOCK / UNBLOCK
exports.toggleBlockStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let driver = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    driver.block_status = driver.block_status === 1 ? 0 : 1;
    await driver.save();

    const isBlocked = driver.block_status === 1;
    return res.status(200).json({
      success: true,
      message: isBlocked
        ? "Driver blocked successfully"
        : "Driver unblocked successfully",
      block_status: driver.block_status,
      blocked: isBlocked,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE DRIVER PROFILE DETAILS & DOCUMENTS
exports.updateDriver = async (req, res) => {
  try {
    const id = req.params.id || (req.driver && req.driver._id);
    let driver = null;
    if (id && mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && id && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }
    if (!driver && req.driver) {
      driver = req.driver;
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const {
      name,
      last_name,
      email,
      number,
      dob,
      state,
      gender,
      license_number,
      address,
      vehicle_number,
      cateogory,
      brand,
      model,
      color,
      manufacturing_year,
      aadhaar_number,
      wallet,
    } = req.body;

    if (name) driver.name = name.trim();
    if (last_name) driver.last_name = last_name.trim();
    if (email) driver.email = email.trim();
    if (number) driver.number = number.trim();
    if (dob) driver.dob = dob;
    if (state) driver.state = state.trim();
    if (gender) driver.gender = gender;
    if (license_number) driver.license_number = license_number.trim();
    if (address) driver.address = address.trim();
    if (vehicle_number) driver.vehicle_number = vehicle_number.trim();
    if (cateogory) driver.cateogory = cateogory;
    if (brand) driver.brand = brand;
    if (model) driver.model = model;
    if (color) driver.color = color;
    if (manufacturing_year) driver.manufacturing_year = manufacturing_year;
    if (aadhaar_number) driver.aadhaar_number = aadhaar_number.trim();
    if (req.body.referByCode !== undefined)
      driver.referByCode = req.body.referByCode
        ? req.body.referByCode.trim()
        : null;
    if (req.body.referalCode !== undefined)
      driver.referalCode = req.body.referalCode
        ? req.body.referalCode.trim()
        : null;
    if (wallet !== undefined) {
      const oldWallet = Number(driver.wallet) || 0;
      const newWallet = Number(wallet);
      driver.wallet = newWallet;

      // If wallet was increased (e.g. admin recharged wallet), log recharge & record referral commission
      if (newWallet > oldWallet) {
        const addedAmount = newWallet - oldWallet;
        DriverWalletRecharge.create({
          driver_id: driver._id,
          amount: `+${addedAmount}`,
          transaction_id: "Wallet Recharge by Admin",
          status: "1",
        })
          .then(async (rechargeRecord) => {
            if (driver.referByCode && driver.referByCode.trim() !== "") {
              await recordReferralCommission(
                rechargeRecord._id,
                driver,
                addedAmount,
              );
            }
          })
          .catch((err) =>
            console.error("Error creating recharge/referral record:", err),
          );
      }
    }

    // Handle files if uploaded
    if (req.files && req.files.length > 0) {
      req.files.forEach((f) => {
        const relPath = "uploads/drivers/" + f.filename;
        if (f.fieldname === "image") driver.image = relPath;
        if (f.fieldname === "vehicle_front_image")
          driver.vehicle_front_image = relPath;
        if (f.fieldname === "vehicle_back_image")
          driver.vehicle_back_image = relPath;
        if (f.fieldname === "vehicle_interior_image")
          driver.vehicle_interior_image = relPath;
        if (f.fieldname === "driving_licence_front")
          driver.driving_licence_front = relPath;
        if (f.fieldname === "driving_licence_back")
          driver.driving_licence_back = relPath;
        if (f.fieldname === "insurence_front") driver.insurence_front = relPath;
        if (f.fieldname === "insurence_back") driver.insurence_back = relPath;
        if (f.fieldname === "id_proof_front") driver.id_proof_front = relPath;
        if (f.fieldname === "id_proof_back") driver.id_proof_back = relPath;
        if (f.fieldname === "vehicle_rc_front")
          driver.vehicle_rc_front = relPath;
        if (f.fieldname === "vehicle_rc_back") driver.vehicle_rc_back = relPath;
        if (f.fieldname === "government_id_proof")
          driver.government_id_proof = relPath;
      });

      driver.status = 1;
      driver.document_verify_status = "pending";
    }

    await driver.save();

    return res.status(200).json({
      status: true,
      success: true,
      message: "Driver profile updated successfully",
      driver,
    });
  } catch (err) {
    console.error("Error in updateDriver:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE DRIVER
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await Driver.findByIdAndDelete(id);
    } else if (!isNaN(Number(id))) {
      await Driver.findOneAndDelete({ driver_id: Number(id) });
    }
    return res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET DRIVER WALLET RECHARGE & DEDUCTION HISTORY BY DRIVER ID (ADMIN)
exports.getDriverWalletHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    let driver = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }
    if (!driver) {
      driver = await Driver.findOne({ number: id });
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const driverQueryIds = [driver._id, String(driver._id)];
    if (driver.driver_id) driverQueryIds.push(driver.driver_id);

    const history = await DriverWalletRecharge.find({
      driver_id: { $in: driverQueryIds },
    })
      .populate("booking_id", "from to totalFare status date")
      .sort({ created_at: -1, createdAt: -1 });

    const formattedHistory = history.map((item, idx) => {
      const dt = new Date(item.created_at || item.createdAt || Date.now());
      const dateStr = dt.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeStr = dt.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const rawAmount = String(item.amount || "0");
      const cleanAmount =
        rawAmount.startsWith("+") || rawAmount.startsWith("-")
          ? rawAmount
          : `+${rawAmount}`;

      return {
        id: item._id.toString(),
        _id: item._id.toString(),
        srNo: idx + 1,
        date: `${dateStr} ${timeStr}`,
        amount: cleanAmount,
        type:
          item.transaction_id ||
          (item.booking_id
            ? `Booking ID: ${item.booking_id._id || item.booking_id}`
            : "Wallet Transaction"),
        status: item.status || "1",
        driverName:
          `${driver.name || "Driver"} ${driver.last_name || ""}`.trim(),
        driverPhone: driver.number || "",
        booking: item.booking_id || null,
      };
    });

    return res.status(200).json({
      success: true,
      driver: {
        id: driver._id.toString(),
        name: `${driver.name || "Driver"} ${driver.last_name || ""}`.trim(),
        number: driver.number || "",
        wallet: driver.wallet || 0,
        image: formatImageUrl(driver.image, req),
      },
      history: formattedHistory,
      total: formattedHistory.length,
    });
  } catch (err) {
    console.error("Error in getDriverWalletHistoryById:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// RECHARGE DRIVER WALLET (ADMIN / API)
exports.rechargeDriverWallet = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, transaction_id } = req.body;
    const rechargeAmt = Number(amount);
    if (!rechargeAmt || rechargeAmt <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid recharge amount. Must be greater than 0.",
        });
    }

    let driver = null;
    if (mongoose.Types.ObjectId.isValid(id)) driver = await Driver.findById(id);
    if (!driver && !isNaN(Number(id)))
      driver = await Driver.findOne({ driver_id: Number(id) });
    if (!driver) driver = await Driver.findOne({ number: id });

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const prevWallet = Number(driver.wallet) || 0;
    driver.wallet = prevWallet + rechargeAmt;
    await driver.save();

    const rechargeRecord = await DriverWalletRecharge.create({
      driver_id: driver._id,
      amount: `+${rechargeAmt}`,
      transaction_id: transaction_id || "Wallet Recharge via API",
      status: "1",
    });

    // Automatically calculate and record 5% referral commission if referred
    let commRecord = null;
    if (driver.referByCode && driver.referByCode.trim() !== "") {
      commRecord = await exports.recordReferralCommission(
        rechargeRecord._id,
        driver,
        rechargeAmt,
      );
    }

    return res.status(200).json({
      success: true,
      message: `Driver wallet recharged by ₹${rechargeAmt}. New balance: ₹${driver.wallet}`,
      wallet: driver.wallet,
      rechargeRecord,
      referralCommission: commRecord
        ? {
            referrerId: commRecord.referrer_id,
            referByCode: commRecord.referByCode,
            rechargeAmount: commRecord.amount,
            commissionPercent: "5%",
            commissionAmount: commRecord.commisionAmount,
            status: commRecord.status === "0" ? "Pending" : "Credited",
          }
        : null,
    });
  } catch (err) {
    console.error("Error in rechargeDriverWallet:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL DRIVERS WALLET RECHARGE HISTORY (ADMIN)
exports.getAllRechargeHistory = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Time-based calculations for stats
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

    const allRecharges = await DriverWalletRecharge.find()
      .populate("driver_id", "name last_name number wallet")
      .sort({ created_at: -1, createdAt: -1 });

    let totalSum = 0;
    let todaySum = 0;
    let weekSum = 0;
    let monthSum = 0;
    let yearSum = 0;

    allRecharges.forEach((r) => {
      const amtNum =
        parseFloat(String(r.amount).replace(/[^0-9.-]+/g, "")) || 0;
      const rDate = new Date(r.created_at || r.createdAt || Date.now());
      if (amtNum > 0) {
        totalSum += amtNum;
        if (rDate >= startOfToday) todaySum += amtNum;
        if (rDate >= startOfWeek) weekSum += amtNum;
        if (rDate >= startOfMonth) monthSum += amtNum;
        if (rDate >= startOfYear) yearSum += amtNum;
      }
    });

    let filtered = allRecharges;
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = allRecharges.filter((r) => {
        const dName = r.driver_id
          ? `${r.driver_id.name || ""} ${r.driver_id.last_name || ""}`.toLowerCase()
          : "";
        const dNum = r.driver_id?.number || "";
        const txn = (r.transaction_id || "").toLowerCase();
        const amt = String(r.amount || "");
        return (
          dName.includes(q) ||
          dNum.includes(q) ||
          txn.includes(q) ||
          amt.includes(q)
        );
      });
    }

    const totalRecords = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    const formattedList = paginated.map((r, idx) => {
      const dt = new Date(r.created_at || r.createdAt || Date.now());
      const dName = r.driver_id
        ? `${r.driver_id.name || "Driver"} ${r.driver_id.last_name || ""}`.trim()
        : "Driver";
      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        srNo: skip + idx + 1,
        name: dName,
        driverId: r.driver_id?._id || r.driver_id,
        driverPhone: r.driver_id?.number || "",
        type: "Driver",
        amount: r.amount || "0.00",
        txnId: r.transaction_id || `TXN_${r._id.toString().slice(-6)}`,
        date:
          dt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) +
          " " +
          dt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };
    });

    const stats = [
      {
        label: `Total: ₹${totalSum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        color: "#2563eb",
      },
      {
        label: `Today: ₹${todaySum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        color: "#16803c",
      },
      {
        label: `This Week: ₹${weekSum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        color: "#06b6d4",
      },
      {
        label: `This Month: ₹${monthSum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        color: "#f59e0b",
      },
      {
        label: `This Year: ₹${yearSum.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        color: "#dc2626",
      },
    ];

    return res.status(200).json({
      success: true,
      stats,
      totalResults: totalRecords,
      totalPages: Math.ceil(totalRecords / limitNum) || 1,
      currentPage: pageNum,
      recharges: formattedList,
    });
  } catch (err) {
    console.error("Error in getAllRechargeHistory:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET DRIVER RIDES BY ID (FOR ADMIN & CRM)
exports.getDriverRidesById = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, search } = req.query;

    let driver = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }
    if (!driver) {
      driver = await Driver.findOne({ number: id });
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const driverIds = [driver._id];
    if (driver.driver_id !== undefined && driver.driver_id !== null) {
      driverIds.push(driver.driver_id);
    }
    if (mongoose.Types.ObjectId.isValid(id)) {
      driverIds.push(new mongoose.Types.ObjectId(id));
    }
    driverIds.push(String(driver._id));
    driverIds.push(id);

    const matchQuery = { driver_id: { $in: driverIds } };

    if (status && status !== "all") {
      if (status === "ongoing" || status === "in_progress") {
        matchQuery.status = { $in: ["ongoing", "in_progress", "arrived"] };
      } else {
        matchQuery.status = status;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      matchQuery.$or = [
        { from: { $regex: q, $options: "i" } },
        { to: { $regex: q, $options: "i" } },
        { totalFare: { $regex: q, $options: "i" } },
        { distance: { $regex: q, $options: "i" } },
        { date: { $regex: q, $options: "i" } },
      ];
    }

    const rides = await Ride.find(matchQuery)
      .populate("user_id", "name number phone image")
      .populate("vehicle_id", "typeName icon")
      .sort({ created_at: -1, createdAt: -1 });

    const formattedRides = rides.map((r, idx) => {
      const u = r.user_id;
      const v = r.vehicle_id;
      const dateObj = new Date(r.created_at || r.createdAt || Date.now());
      const dateStr = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeStr = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const distVal = r.distance
        ? String(r.distance).toLowerCase().includes("km")
          ? r.distance
          : `${r.distance} Km`
        : "0.00 Km";
      const fareVal = r.totalFare
        ? String(r.totalFare).includes("₹")
          ? r.totalFare
          : `₹${r.totalFare}`
        : "₹0";

      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        srNo: idx + 1,
        userName: u?.name || "Customer",
        userNumber: u?.number || u?.phone || "+910000000000",
        userImage: formatImageUrl(u?.image, req),
        vehicleName: v?.typeName || "Sedan",
        from: r.from || "N/A",
        to: r.to || "N/A",
        distance: distVal,
        fare: fareVal,
        totalFare: fareVal,
        rideFare: `₹${r.rideFare || r.totalFare || 0}`,
        status:
          r.status === "ongoing" || r.status === "arrived"
            ? "in_progress"
            : r.status,
        rawStatus: r.status,
        reason: r.reson || "N/A",
        date: r.date || dateStr,
        time: r.time || timeStr,
        bookingType: r.booking_type || "inCity",
        createdAt: r.created_at || r.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      driver: {
        id: driver._id.toString(),
        _id: driver._id.toString(),
        name: `${driver.name || "Driver"} ${driver.last_name || ""}`.trim(),
        number: driver.number || "",
        email: driver.email || "",
        wallet: driver.wallet || 0,
        image: formatImageUrl(driver.image, req),
        state: driver.state || "",
        vehicleNumber: driver.vehicle_number || "",
      },
      rides: formattedRides,
      total: formattedRides.length,
    });
  } catch (err) {
    console.error("Error in getDriverRidesById:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Driver Logout (Mobile App Self-Logout OR Admin Force Logout)
// @route   GET /api/driver-logout  OR  POST /api/driver-logout  OR  POST /api/drivers/:id/logout  OR  PATCH /api/drivers/:id/logout
exports.logoutDriver = async (req, res) => {
  try {
    // -------------------------------------------------------------
    // Branch A: Admin / Sub-Admin Force Logout via Web Panel (by Driver ID)
    // -------------------------------------------------------------
    const targetId =
      req.params?.id || (req.body && (req.body.driverId || req.body.id));

    if (targetId) {
      let driver = null;
      if (targetId.toString().match(/^[0-9a-fA-F]{24}$/)) {
        driver = await Driver.findById(targetId);
      }
      if (!driver && !isNaN(targetId)) {
        driver = await Driver.findOne({ driver_id: Number(targetId) });
      }
      if (!driver) {
        driver = await Driver.findOne({ number: targetId.toString() });
      }

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      // Clear active session, token, registration ID, and set offline
      driver.token = null;
      driver.reg_id = null;
      driver.active_status = 0;
      await driver.save();

      console.log(
        `🔒 [ADMIN FORCE LOGOUT] Successfully cleared session for driver: ${driver.name} (${driver.number})`,
      );

      return res.status(200).json({
        success: true,
        message: "Driver logged out successfully from all devices",
      });
    }

    // -------------------------------------------------------------
    // Branch B: Mobile App Self-Logout (PHP: ApiController::twenty)
    // -------------------------------------------------------------
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    let token = req.headers["token"] || req.headers["x-access-token"];
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    let driver = await Driver.findOne({ token: token });

    if (!driver) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "bhrosacab_secret_key_2026_8409586058",
        );
        if (decoded && (decoded.id || decoded.driver_id || decoded.number)) {
          driver = await Driver.findOne({
            $or: [
              { _id: decoded.id },
              { driver_id: decoded.driver_id },
              { number: decoded.number },
            ],
          });
        }
      } catch (jwtErr) {
        // Token invalid / expired
      }
    }

    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    // Clear active session, token, registration ID, set offline, and set register = 1
    driver.token = null;
    driver.reg_id = null;
    driver.active_status = 0;
    driver.register = 1;
    await driver.save();

    console.log(
      `🔒 [APP LOGOUT] Driver self logged out successfully: ${driver.name} (${driver.number})`,
    );

    return res.status(200).json({
      message: "Logout Successfully",
    });
  } catch (error) {
    console.error("logoutDriver Error:", error);
    return res.status(500).json({
      message: "Error",
      details: error.message,
    });
  }
};

/* =========================================================================
   3. DRIVER REFERRAL & 5% MONTHLY COMMISSION ENGINE
   ========================================================================= */

/**
 * Record 5% referral commission whenever a referred driver's wallet is recharged.
 * @param {ObjectId|string|number} rechargeId - Recharge record ID
 * @param {Object} driver - The driver who recharged
 * @param {number} rechargeAmount - Amount in INR
 */
async function recordReferralCommission(rechargeId, driver, rechargeAmount) {
  try {
    const amt = Number(rechargeAmount);
    if (!amt || amt <= 0) return null;
    if (!driver || !driver.referByCode || driver.referByCode.trim() === "")
      return null;

    const refCode = driver.referByCode.trim();

    // Find referrer driver by referalCode
    const referrer = await Driver.findOne({
      referalCode: { $regex: new RegExp(`^${refCode}$`, "i") },
    });

    if (!referrer) {
      console.warn(
        `[REFERRAL COMMISSION] Referrer with code '${refCode}' not found for driver ${driver.name || driver.number}`,
      );
      return null;
    }

    // 5% Commission calculation (rounded to nearest integer like MySQL sample data)
    const commisionInPercent = 5;
    const commisionAmount = Math.round((amt * commisionInPercent) / 100);

    const now = new Date();
    const payoutMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const commEntry = await DriverCommisionReferBy.create({
      driverWalletRechargeId: rechargeId || null,
      driver_id: driver._id,
      referByCode: refCode,
      referrer_id: referrer._id,
      amount: amt,
      commisionInPercent,
      commisionAmount: commisionAmount > 0 ? commisionAmount : 1, // Minimum ₹1 if calculation yields 0
      status: "0", // 0 = Pending (will be credited on 1st of next month)
      payoutMonth,
    });

    console.log(
      `💰 [REFERRAL 5%] Recorded ₹${commEntry.commisionAmount} commission for Referrer ${referrer.name} (${refCode}) from Driver ${driver.name} recharge of ₹${amt}`,
    );
    return commEntry;
  } catch (err) {
    console.error("Error recording referral commission:", err);
    return null;
  }
}
exports.recordReferralCommission = recordReferralCommission;

/**
 * GET /api/drivers/:id/referrals
 * Returns list of all drivers who registered using this driver's referral code.
 */
exports.getDriverReferrals = async (req, res) => {
  try {
    const { id } = req.params;
    let driver = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }
    if (!driver) {
      driver = await Driver.findOne({ number: id });
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const driverRefCode = driver.referalCode;
    if (!driverRefCode || driverRefCode.trim() === "") {
      return res.status(200).json({
        success: true,
        driver: {
          id: driver._id,
          name: `${driver.name || ""} ${driver.last_name || ""}`.trim(),
          referalCode: driverRefCode || "N/A",
        },
        referrals: [],
        total: 0,
      });
    }

    // Find all drivers whose referByCode matches this driver's referalCode
    const referredDrivers = await Driver.find({
      referByCode: { $regex: new RegExp(`^${driverRefCode.trim()}$`, "i") },
    }).sort({ created_at: -1, createdAt: -1 });

    const formattedReferrals = referredDrivers.map((d, idx) => {
      const dt = new Date(d.created_at || d.createdAt || Date.now());
      return {
        id: d._id.toString(),
        _id: d._id.toString(),
        srNo: idx + 1,
        image:
          formatImageUrl(d.image, req) ||
          "https://ui-avatars.com/api/?name=" +
            encodeURIComponent(d.name || "Driver") +
            "&background=0D8ABC&color=fff",
        name: `${d.name || "Driver"} ${d.last_name || ""}`.trim(),
        email: d.email || "N/A",
        phone: d.number || "N/A",
        state: d.state || "N/A",
        status: getStatusLabel(d.status),
        date: dt.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    });

    return res.status(200).json({
      success: true,
      driver: {
        id: driver._id,
        name: `${driver.name || ""} ${driver.last_name || ""}`.trim(),
        referalCode: driverRefCode,
      },
      referrals: formattedReferrals,
      total: formattedReferrals.length,
    });
  } catch (err) {
    console.error("Error in getDriverReferrals:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/drivers/:id/referral-commission
 * Returns referral commission summary and list of 5% recharge commissions.
 */
exports.getDriverReferralCommissions = async (req, res) => {
  try {
    const { id } = req.params;
    let driver = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      driver = await Driver.findById(id);
    }
    if (!driver && !isNaN(Number(id))) {
      driver = await Driver.findOne({ driver_id: Number(id) });
    }
    if (!driver) {
      driver = await Driver.findOne({ number: id });
    }

    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found" });
    }

    const driverRefCode = driver.referalCode || "";

    const query = {
      $or: [
        { referrer_id: driver._id },
        ...(driverRefCode
          ? [
              {
                referByCode: {
                  $regex: new RegExp(`^${driverRefCode.trim()}$`, "i"),
                },
              },
            ]
          : []),
      ],
    };

    const commissions = await DriverCommisionReferBy.find(query)
      .populate("driver_id", "name last_name number state image")
      .sort({ created_at: -1, createdAt: -1 });

    let totalCommission = 0;
    let pendingCommission = 0;
    let paidCommission = 0;

    commissions.forEach((c) => {
      const amt = Number(c.commisionAmount) || 0;
      totalCommission += amt;
      if (c.status === "1") {
        paidCommission += amt;
      } else {
        pendingCommission += amt;
      }
    });

    const formattedList = commissions.map((c, idx) => {
      const dt = new Date(c.created_at || c.createdAt || Date.now());
      const referredDriver = c.driver_id;
      const dName = referredDriver
        ? `${referredDriver.name || "Driver"} ${referredDriver.last_name || ""}`.trim()
        : "Referred Driver";
      const dPhone = referredDriver?.number || "N/A";
      const dState = referredDriver?.state || "N/A";

      return {
        id: c._id.toString(),
        _id: c._id.toString(),
        srNo: idx + 1,
        driverName: dName,
        mobile: dPhone,
        state: dState,
        rechargeAmount: `₹ ${Number(c.amount || 0).toFixed(2)}`,
        commissionPercent: `${c.commisionInPercent || 5}%`,
        commissionAmount: `₹ ${Number(c.commisionAmount || 0).toFixed(2)}`,
        status:
          c.status === "1" ? "Credited to Wallet" : "Pending (Credits on 1st)",
        statusCode: c.status || "0",
        date:
          dt.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }) +
          " " +
          dt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
      };
    });

    return res.status(200).json({
      success: true,
      summary: {
        referralDriver:
          `${driver.name || "Driver"} ${driver.last_name || ""}`.trim(),
        referralCode: driverRefCode || "N/A",
        totalCommission: totalCommission.toFixed(2),
        pendingCommission: pendingCommission.toFixed(2),
        paidCommission: paidCommission.toFixed(2),
      },
      commissions: formattedList,
      total: formattedList.length,
    });
  } catch (err) {
    console.error("Error in getDriverReferralCommissions:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Process Monthly Referral Commission Payout (Crediting to Driver Wallets)
 * Logic: All pending commissions ('0') earned in the previous calendar month
 * are aggregated for each referrer driver and credited to their wallet on the 1st.
 * Can be triggered manually by Admin or called via cron/schedule.
 * POST /api/drivers/referral-commission/process-payout
 */
exports.processMonthlyReferralPayout = async (req, res) => {
  try {
    const now = new Date();
    // Default target: All pending commission records up to end of previous month
    // Or if forceAll is set, all pending commissions regardless of month
    const forceAll =
      req.body?.forceAll === true || req.query?.forceAll === "true";

    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );

    const matchFilter = { status: "0" };
    if (!forceAll) {
      matchFilter.$or = [
        { created_at: { $lte: endOfPreviousMonth } },
        { createdAt: { $lte: endOfPreviousMonth } },
      ];
    }

    const pendingCommissions = await DriverCommisionReferBy.find(matchFilter);

    if (pendingCommissions.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          "No pending referral commissions to process for monthly payout.",
        processedDrivers: 0,
        totalCredited: 0,
      });
    }

    // Group pending commissions by referrer_id or referByCode
    const referrerMap = {};
    for (const comm of pendingCommissions) {
      let refId = comm.referrer_id ? String(comm.referrer_id) : null;
      if (!refId && comm.referByCode) {
        const refDriver = await Driver.findOne({
          referalCode: {
            $regex: new RegExp(`^${comm.referByCode.trim()}$`, "i"),
          },
        });
        if (refDriver) {
          refId = String(refDriver._id);
          comm.referrer_id = refDriver._id;
          await comm.save();
        }
      }

      if (refId) {
        if (!referrerMap[refId]) {
          referrerMap[refId] = { totalAmount: 0, commissionIds: [] };
        }
        referrerMap[refId].totalAmount += Number(comm.commisionAmount) || 0;
        referrerMap[refId].commissionIds.push(comm._id);
      }
    }

    let totalCreditedAcrossAll = 0;
    let processedDriversCount = 0;
    const payoutDetails = [];

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const payoutMonthLabel = `${monthNames[now.getMonth() === 0 ? 11 : now.getMonth() - 1]} ${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}`;

    for (const [refDriverId, data] of Object.entries(referrerMap)) {
      const driver = await Driver.findById(refDriverId);
      if (!driver) continue;

      const creditAmt = data.totalAmount;
      if (creditAmt <= 0) continue;

      // 1. Add commission to Driver's wallet
      const prevWallet = Number(driver.wallet) || 0;
      driver.wallet = prevWallet + creditAmt;
      await driver.save();

      // 2. Create DriverWalletRecharge transaction record
      await DriverWalletRecharge.create({
        driver_id: driver._id,
        amount: `+${creditAmt}`,
        transaction_id: `Referral Commission Payout (${payoutMonthLabel})`,
        status: "1",
      });

      // 3. Mark all commission items as completed (status = '1')
      await DriverCommisionReferBy.updateMany(
        { _id: { $in: data.commissionIds } },
        {
          $set: {
            status: "1",
            credited_at: new Date(),
          },
        },
      );

      totalCreditedAcrossAll += creditAmt;
      processedDriversCount += 1;
      payoutDetails.push({
        driverId: driver._id,
        driverName:
          `${driver.name || "Driver"} ${driver.last_name || ""}`.trim(),
        creditedAmount: creditAmt,
        newWallet: driver.wallet,
        commissionCount: data.commissionIds.length,
      });

      console.log(
        `✅ [REFERRAL PAYOUT] Credited ₹${creditAmt} to ${driver.name} for ${payoutMonthLabel}. New wallet balance: ₹${driver.wallet}`,
      );
    }

    return res.status(200).json({
      success: true,
      message: `Successfully processed monthly referral payout for ${payoutMonthLabel}`,
      payoutMonth: payoutMonthLabel,
      processedDrivers: processedDriversCount,
      totalCredited: totalCreditedAcrossAll,
      payoutDetails,
    });
  } catch (err) {
    console.error("Error in processMonthlyReferralPayout:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Background auto-checker for monthly 1st payout
 */
exports.runMonthlyPayoutSchedule = async () => {
  try {
    const now = new Date();
    // Only execute on the 1st of the month
    if (now.getDate() !== 1) return;

    const endOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
      999,
    );
    const pendingCommissions = await DriverCommisionReferBy.find({
      status: "0",
      $or: [
        { created_at: { $lte: endOfPreviousMonth } },
        { createdAt: { $lte: endOfPreviousMonth } },
      ],
    });

    if (pendingCommissions.length === 0) return;

    const referrerMap = {};
    for (const comm of pendingCommissions) {
      let refId = comm.referrer_id ? String(comm.referrer_id) : null;
      if (!refId && comm.referByCode) {
        const refDriver = await Driver.findOne({
          referalCode: {
            $regex: new RegExp(`^${comm.referByCode.trim()}$`, "i"),
          },
        });
        if (refDriver) {
          refId = String(refDriver._id);
          comm.referrer_id = refDriver._id;
          await comm.save();
        }
      }
      if (refId) {
        if (!referrerMap[refId])
          referrerMap[refId] = { totalAmount: 0, commissionIds: [] };
        referrerMap[refId].totalAmount += Number(comm.commisionAmount) || 0;
        referrerMap[refId].commissionIds.push(comm._id);
      }
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const payoutMonthLabel = `${monthNames[now.getMonth() === 0 ? 11 : now.getMonth() - 1]} ${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}`;

    for (const [refDriverId, data] of Object.entries(referrerMap)) {
      const driver = await Driver.findById(refDriverId);
      if (!driver || data.totalAmount <= 0) continue;

      const prevWallet = Number(driver.wallet) || 0;
      driver.wallet = prevWallet + data.totalAmount;
      await driver.save();

      await DriverWalletRecharge.create({
        driver_id: driver._id,
        amount: `+${data.totalAmount}`,
        transaction_id: `Referral Commission Payout (${payoutMonthLabel})`,
        status: "1",
      });

      await DriverCommisionReferBy.updateMany(
        { _id: { $in: data.commissionIds } },
        { $set: { status: "1", credited_at: new Date() } },
      );
      console.log(
        `[MONTHLY AUTO PAYOUT] Credited ₹${data.totalAmount} to driver ${driver.name} for ${payoutMonthLabel}`,
      );
    }
  } catch (err) {
    console.error("[MONTHLY AUTO PAYOUT ERROR]:", err);
  }
};

// MOBILE APP: GET CAR BOOKINGS FOR DRIVER (Equivalent to PHP: Route::any('get-car-bookings-driver', 'thirtyOne'))
exports.getCarBookingsDriver = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const driverToken =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!driverToken) {
      return res.status(400).json({
        message: "Driver token not provided",
      });
    }

    const driver = await Driver.findOne({
      $or: [{ token: driverToken }, { appToken: driverToken }],
    });

    if (!driver) {
      return res.status(200).json({
        message: "Invalid Token",
      });
    }

    let requiredWallet = 0;
    try {
      const setting = await AppSetting.findOne({
        key: {
          $in: ["min_wallet_amount", "wallet_amount", "minimum_wallet_amount"],
        },
      });
      if (setting && !isNaN(Number(setting.value))) {
        requiredWallet = Number(setting.value);
      }
    } catch (e) {}

    const driverWallet = Number(driver.wallet) || 0;
    if (driverWallet < requiredWallet) {
      return res.status(402).json({
        message: "Driver wallet amount is below limit",
      });
    }

    const driverOnline = Number(driver.active_status) === 1;
    if (!driverOnline) {
      return res.status(402).json({
        message: "Please Online",
      });
    }

    const vehicleType = driver.cateogory;
    if (!vehicleType && vehicleType !== 0) {
      return res.status(404).json({
        message: "Driver vehicle details not found",
      });
    }

    const vTypeFilter = [
      vehicleType,
      String(vehicleType),
      !isNaN(Number(vehicleType)) ? Number(vehicleType) : null,
    ].filter((v) => v !== null);

    let rides = await CarBooking.find({
      $or: [
        { car_type: { $in: vTypeFilter } },
        { type: { $in: vTypeFilter } },
      ],
      driver_reject_status: { $ne: 1 },
    })
      .sort({ createdAt: -1, created_at: -1, _id: -1 })
      .lean();

    try {
      const razorRides = await mongoose.connection.db
        .collection("book_section_razor_pays")
        .find({
          type: { $in: vTypeFilter },
          driver_reject_status: { $ne: 1 },
        })
        .sort({ created_at: -1 })
        .toArray();
      if (razorRides && razorRides.length > 0) {
        rides = [...rides, ...razorRides];
      }
    } catch (e) {}

    if (!rides || rides.length === 0) {
      return res.status(404).json({ message: "No Bookings Found" });
    }

    // Group rides by user_id and take first (latest)
    const seenUsers = new Set();
    const uniqueRides = [];
    for (const r of rides) {
      const uId = String(r.user_id);
      if (!seenUsers.has(uId)) {
        seenUsers.add(uId);
        uniqueRides.push(r);
      }
    }

    const responseBookings = [];
    const earthRadius = 6371000;

    for (const ride of uniqueRides) {
      const user = await User.findOne({
        $or: [
          ...(mongoose.isValidObjectId(ride.user_id)
            ? [{ _id: ride.user_id }]
            : []),
          { id: ride.user_id },
          { id: String(ride.user_id) },
          ...(!isNaN(Number(ride.user_id))
            ? [{ mysqlId: Number(ride.user_id) }]
            : []),
        ],
      });
      if (!user) continue;

      let location = await SendLocation.findOne({
        $or: [{ user_id: user._id }, { user_id: String(user._id) }],
      }).sort({ createdAt: -1, created_at: -1, _id: -1 });

      if (!location && (ride.from_latitude || ride.destination_latitude)) {
        location = {
          from_address: ride.from_address || "",
          destination_address: ride.destination_address || "",
          from_latitude: ride.from_latitude,
          from_longitude: ride.from_longitude,
          destination_latitude: ride.destination_latitude,
          destination_longitude: ride.destination_longitude,
          created_at: ride.created_at || ride.createdAt,
        };
      }
      if (!location) continue;

      const fromLat = parseFloat(location.from_latitude);
      const fromLng = parseFloat(location.from_longitude);
      const toLat = parseFloat(location.destination_latitude);
      const toLng = parseFloat(location.destination_longitude);

      let distance = 0;
      if (!isNaN(fromLat) && !isNaN(fromLng) && !isNaN(toLat) && !isNaN(toLng)) {
        const latFrom = (fromLat * Math.PI) / 180;
        const lonFrom = (fromLng * Math.PI) / 180;
        const latTo = (toLat * Math.PI) / 180;
        const lonTo = (toLng * Math.PI) / 180;

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

      responseBookings.push({
        id: ride.id || (ride._id ? String(ride._id) : ""),
        user_id: String(ride.user_id || user._id),
        address_id: String(ride.address_id || ""),
        transection_id: ride.transection_id || null,
        amount: String(ride.amount || "0"),
        type: String(ride.type || ride.car_type || vehicleType),
        payment_status: String(ride.payment_status || "0"),
        currency: ride.currency || ride.Currency || "₹",
        driver_reject_status: ride.driver_reject_status || 0,
        driver_id: ride.driver_id || null,
        created_at: ride.created_at || ride.createdAt || new Date(),
        updated_at: ride.updated_at || ride.updatedAt || new Date(),
        name: user.name || "",
        number: user.number || "",
        email: user.email || "",
        country_code: user.country_code || "+91",
        image: formatImageUrl(user.image, req),
        from_address: location.from_address || "",
        destination_address: location.destination_address || "",
        from_latitude: String(location.from_latitude || ""),
        from_longitude: String(location.from_longitude || ""),
        destination_latitude: String(location.destination_latitude || ""),
        destination_longitude: String(location.destination_longitude || ""),
        send_location_created_at:
          location.created_at || location.createdAt || null,
        car_booking_created_at: ride.created_at || ride.createdAt || null,
        reg_id: user.reg_id || null,
        distance: distance,
      });
    }

    if (responseBookings.length === 0) {
      return res.status(404).json({
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Rides Bookings retrieved successfully",
      data: responseBookings,
    });
  } catch (ex) {
    console.error("getCarBookingsDriver Error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// MOBILE APP: GET REFERRAL COMMISSION (Equivalent to PHP: Route::any('get-referal-commision', 'get_referal_commision'))
exports.getReferralCommissionMobile = async (req, res) => {
  try {
    if (req.method !== "GET") {
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

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const driverRefCode = driver.referalCode || "";
    let commissions = [];
    if (driverRefCode) {
      commissions = await DriverCommisionReferBy.find({
        $or: [
          {
            referByCode: {
              $regex: new RegExp(`^${driverRefCode.trim()}$`, "i"),
            },
          },
          { referrer_id: driver._id },
        ],
      }).lean();
    }

    if (commissions && commissions.length > 0) {
      let totalCommission = 0;
      const details = [];

      for (const item of commissions) {
        const amt = Number(item.commisionAmount) || 0;
        totalCommission += amt;

        let driverReferralCode = null;
        if (item.driver_id) {
          const referredDriver = await Driver.findOne({
            $or: [
              ...(mongoose.isValidObjectId(item.driver_id)
                ? [{ _id: item.driver_id }]
                : []),
              { id: item.driver_id },
              ...(!isNaN(Number(item.driver_id))
                ? [{ mysqlId: Number(item.driver_id) }]
                : []),
            ],
          });
          if (referredDriver) {
            driverReferralCode = referredDriver.referalCode || null;
          }
        }

        details.push({
          ...item,
          id: item._id ? String(item._id) : item.id,
          driver_referal_code: driverReferralCode,
        });
      }

      return res.status(200).json({
        message: "Referal Commision Get Successfully",
        total_commission: totalCommission,
        details: details,
      });
    }

    return res.status(201).json({
      message: "No Referal Commision Found",
    });
  } catch (ex) {
    console.error("getReferralCommissionMobile Error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// MOBILE APP: DRIVER ACCEPT BOOKING (Equivalent to PHP: Route::any('driver-accept-booking', 'thirtyFive'))
exports.driverAcceptBooking = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const bookingId = req.body.id || req.body.booking_id;
    if (!bookingId) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    // Look up in CarBooking or book_section_razor_pays
    let booking = await CarBooking.findOne({
      $or: [
        ...(mongoose.isValidObjectId(bookingId) ? [{ _id: bookingId }] : []),
        { id: bookingId },
        { booking_id: bookingId },
        ...(!isNaN(Number(bookingId))
          ? [{ mysqlId: Number(bookingId) }, { booking_id: Number(bookingId) }]
          : []),
      ],
    }).lean();

    if (!booking) {
      try {
        if (mongoose.connection && mongoose.connection.db) {
          booking = await mongoose.connection.db
            .collection("book_section_razor_pays")
            .findOne({
              $or: [
                ...(mongoose.isValidObjectId(bookingId)
                  ? [{ _id: bookingId }]
                  : []),
                { id: bookingId },
                ...(!isNaN(Number(bookingId))
                  ? [{ id: Number(bookingId) }]
                  : []),
              ],
            });
        }
      } catch (e) {}
    }

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Address lookup from sendLocation
    let address = null;
    if (booking.address_id) {
      address = await SendLocation.findOne({
        $or: [
          ...(mongoose.isValidObjectId(booking.address_id)
            ? [{ _id: booking.address_id }]
            : []),
          { id: booking.address_id },
          { id: String(booking.address_id) },
        ],
      }).lean();
    }
    if (!address) {
      address = await SendLocation.findOne({
        $or: [
          { user_id: booking.user_id },
          { user_id: String(booking.user_id) },
        ],
      })
        .sort({ createdAt: -1, created_at: -1, _id: -1 })
        .lean();
    }
    if (!address && (booking.from_latitude || booking.destination_latitude)) {
      address = {
        from_address: booking.from_address || "",
        destination_address: booking.destination_address || "",
        from_latitude: booking.from_latitude,
        from_longitude: booking.from_longitude,
        destination_latitude: booking.destination_latitude,
        destination_longitude: booking.destination_longitude,
      };
    }

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    const fromLat = parseFloat(address.from_latitude);
    const fromLng = parseFloat(address.from_longitude);
    const destLat = parseFloat(address.destination_latitude);
    const destLng = parseFloat(address.destination_longitude);

    const earthRadius = 6371000;
    let distance = 0;
    if (!isNaN(fromLat) && !isNaN(fromLng) && !isNaN(destLat) && !isNaN(destLng)) {
      const latFrom = (fromLat * Math.PI) / 180;
      const lonFrom = (fromLng * Math.PI) / 180;
      const latTo = (destLat * Math.PI) / 180;
      const lonTo = (destLng * Math.PI) / 180;

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

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const otp = String(Math.floor(1111 + Math.random() * 8888));

    const checkBookingData = {
      driver_id: driver._id,
      booking_id: booking._id || booking.id,
      user_id: booking.user_id,
      address_id:
        booking.address_id || (address._id ? String(address._id) : null),
      pay_id: bookingId,
      price: booking.amount || "0",
      distance: distance,
      accept_status: "1",
      otp: otp,
      arrive_status: "0",
      from_address: address.from_address || "",
      from_latitude: String(address.from_latitude || ""),
      from_longitude: String(address.from_longitude || ""),
      destination_address: address.destination_address || "",
      destination_latitude: String(address.destination_latitude || ""),
      destination_longitude: String(address.destination_longitude || ""),
    };

    const savedCheckBooking = await DriverCheckBooking.create(checkBookingData);

    // Update reject status in CarBooking and book_section_razor_pays
    await CarBooking.updateMany(
      {
        $or: [
          ...(mongoose.isValidObjectId(bookingId) ? [{ _id: bookingId }] : []),
          { id: bookingId },
          { booking_id: bookingId },
        ],
      },
      { $set: { driver_reject_status: 1 } }
    );
    try {
      if (mongoose.connection && mongoose.connection.db) {
        await mongoose.connection.db
          .collection("book_section_razor_pays")
          .updateMany(
            {
              $or: [
                ...(mongoose.isValidObjectId(bookingId)
                  ? [{ _id: bookingId }]
                  : []),
                { id: bookingId },
              ],
            },
            { $set: { driver_reject_status: 1 } }
          );
      }
    } catch (e) {}

    // User details
    const userDetails = await User.findOne({
      $or: [
        ...(mongoose.isValidObjectId(booking.user_id)
          ? [{ _id: booking.user_id }]
          : []),
        { id: booking.user_id },
      ],
    }).lean();

    const formattedSavedData = {
      ...savedCheckBooking.toObject(),
      id: savedCheckBooking._id.toString(),
      name: userDetails?.name || "Customer",
      image: formatImageUrl(userDetails?.image, req),
      latitude: driver.latitude || null,
      longitude: driver.longitude || null,
    };

    if (userDetails && userDetails.reg_id) {
      const driverName =
        `${driver.name || "Driver"} ${driver.last_name || ""}`.trim();
      const driverNumber = driver.number || "";
      const title = "Booking Accepted";
      const body = `Your booking has been accepted by driver ${driverName} Contact No.(${driverNumber}).`;

      try {
        await fcmService.sendNotification(userDetails.reg_id, title, body);
      } catch (e) {
        console.error("Notification error:", e.message);
      }
    }

    return res.status(200).json({
      message: "Driver accepted booking successfully",
      details: formattedSavedData,
    });
  } catch (ex) {
    console.error("driverAcceptBooking Error:", ex);
    return res.status(500).json({
      message: "Error occurred",
      details: ex.message,
    });
  }
};

// 75. Notification To Drivers For Ride (Registration IDs) (PHP: ApiController::fifty -> 'notification-to-drivers-for-ride')
exports.getDriverRegistrationIdsForRide = async (req, res) => {
  try {
    const drivers = await Driver.find({
      reg_id: { $exists: true, $ne: null, $ne: "" },
    }).select("reg_id").lean();

    const regIds = drivers
      .map((d) => d.reg_id)
      .filter((id) => id && String(id).trim() !== "");

    return res.status(200).json({
      success: true,
      message: "Registration IDs fetched successfully",
      data: regIds,
    });
  } catch (e) {
    console.error("getDriverRegistrationIdsForRide Error:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching registration IDs",
      error: e.message,
    });
  }
};

// 77. Driver Reject Booking (PHP: ApiController::fiftyTwo -> 'driver-reject-booking')
exports.driverRejectBooking = async (req, res) => {
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

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const driverCriteria = [
      driver._id,
      driver._id.toString(),
      ...(driver.id ? [driver.id, String(driver.id)] : []),
      ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
    ];

    const trip = await DriverCheckBooking.findOne({
      driver_id: { $in: driverCriteria },
    }).sort({ created_at: -1, createdAt: -1, _id: -1 });

    if (!trip) {
      return res.status(404).json({
        message: "No booking records found for this driver",
      });
    }

    // 1. Update trip accept_status to 2 (rejected)
    trip.accept_status = 2;
    await trip.save();

    // 2. Update booking driver_reject_status to 2 in CarBooking & book_section_razor_pays
    await CarBooking.updateMany(
      {
        $or: [
          ...(mongoose.isValidObjectId(trip.booking_id)
            ? [{ _id: trip.booking_id }]
            : []),
          { id: trip.booking_id },
          { booking_id: trip.booking_id },
        ],
      },
      { $set: { driver_reject_status: 2 } }
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
              ],
            },
            { $set: { driver_reject_status: 2 } }
          );
      }
    } catch (e) {}

    // 3. Find passenger and send FCM Push Notification
    const user = await User.findOne({
      $or: [
        ...(mongoose.isValidObjectId(trip.user_id) ? [{ _id: trip.user_id }] : []),
        { id: trip.user_id },
        ...(!isNaN(Number(trip.user_id)) ? [{ mysqlId: Number(trip.user_id) }] : []),
      ],
    }).select("name reg_id").lean();

    if (user && user.reg_id) {
      const driverName = driver.name || "Driver";
      const title = "Driver Rejected Booking";
      const body = `The driver ${driverName} has Cancled your booking, Please Find Another Driver `;
      try {
        await fcmService.sendNotification(user.reg_id, title, body);
      } catch (e) {
        console.error("FCM error in driverRejectBooking:", e.message);
      }
    }

    return res.status(200).json({
      message: "Driver rejected the booking successfully",
    });
  } catch (ex) {
    console.error("driverRejectBooking Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 81. Driver Get Reject Booking Status (PHP: ApiController::fiftyfive -> 'driver-get-reject-booking-status')
exports.driverGetRejectBookingStatus = async (req, res) => {
  try {
    if (req.method !== "GET") {
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

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const driverCriteria = [
      driver._id,
      driver._id.toString(),
      ...(driver.id ? [driver.id, String(driver.id)] : []),
      ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
    ];

    const trip = await DriverCheckBooking.findOne({
      driver_id: { $in: driverCriteria },
    })
      .select("accept_status")
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    if (!trip) {
      return res.status(404).json({
        message: "No booking records found for this driver",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Status retrieved successfully",
      status: {
        accept_status: !isNaN(Number(trip.accept_status))
          ? Number(trip.accept_status)
          : trip.accept_status,
      },
    });
  } catch (ex) {
    console.error("driverGetRejectBookingStatus Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 82. Check Booking OTP (PHP: ApiController::fiftySix -> 'check-booking-otp')
exports.checkBookingOtp = async (req, res) => {
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

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const otp = req.body?.otp;
    if (!otp) {
      return res.status(400).json({
        message: "OTP not provided",
      });
    }

    const driverCriteria = [
      driver._id,
      driver._id.toString(),
      ...(driver.id ? [driver.id, String(driver.id)] : []),
      ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
    ];

    const trip = await DriverCheckBooking.findOne({
      driver_id: { $in: driverCriteria },
      accept_status: { $in: [1, "1"] },
    }).sort({ created_at: -1, createdAt: -1, _id: -1 });

    if (!trip) {
      return res.status(404).json({
        message: "No booking records found for this driver with accept_status = 1",
      });
    }

    // Retrieve associated booking
    const booking = await CarBooking.findOne({
      $or: [
        ...(mongoose.isValidObjectId(trip.booking_id)
          ? [{ _id: trip.booking_id }]
          : []),
        { id: trip.booking_id },
        { booking_id: trip.booking_id },
      ],
    });

    const tripOtp =
      trip.otp !== undefined && trip.otp !== null ? String(trip.otp).trim() : null;
    const bookingOtp =
      booking && (booking.booking_otp || booking.otp)
        ? String(booking.booking_otp || booking.otp).trim()
        : null;

    if (
      (tripOtp && tripOtp === String(otp).trim()) ||
      (bookingOtp && bookingOtp === String(otp).trim())
    ) {
      trip.arrive_status = "1";
      await trip.save();

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found",
        });
      }

      // If payment method is wallet (payment_status == 0)
      const paymentStatus = String(
        booking.payment_status ?? trip.payment_status ?? "0"
      );
      if (paymentStatus === "0") {
        const user = await User.findOne({
          $or: [
            ...(mongoose.isValidObjectId(booking.user_id)
              ? [{ _id: booking.user_id }]
              : []),
            { id: booking.user_id },
            ...(!isNaN(Number(booking.user_id))
              ? [{ mysqlId: Number(booking.user_id) }]
              : []),
          ],
        });

        if (!user) {
          return res.status(404).json({
            message: "User wallet not found",
          });
        }

        const fareAmount =
          Number(booking.amount !== undefined ? booking.amount : trip.price || 0) || 0;
        const userWallet = Number(user.wallet) || 0;

        if (userWallet < fareAmount) {
          return res.status(200).json({
            success: false,
            message: "Insufficient wallet balance",
          });
        }

        // Deduct from user wallet
        user.wallet = userWallet - fareAmount;
        await user.save();

        const txnId = "TXN" + Date.now();
        const now = new Date();

        // Create debit entry in UserWalletRecharge
        await UserWalletRecharge.create({
          user_id: user._id,
          amount: String(-fareAmount),
          status: "1",
          booking_id: booking._id ? String(booking._id) : booking.id,
          transaction_id: txnId,
          created_at: now,
          updated_at: now,
        });

        // Credit to driver wallet
        driver.wallet = (Number(driver.wallet) || 0) + fareAmount;
        await driver.save();

        // Create credit entry in DriverWalletRecharge
        await DriverWalletRecharge.create({
          driver_id: driver._id,
          user_id: user._id,
          amount: "+" + fareAmount,
          status: "0",
          booking_id: booking._id ? String(booking._id) : booking.id,
          transaction_id: txnId,
          created_at: now,
          updated_at: now,
        });

        return res.status(200).json({
          success: true,
          message:
            "Right OTP. The payment for this ride has been successfully deducted.",
        });
      }

      if (paymentStatus === "1") {
        return res.status(200).json({
          success: true,
          message: "Right OTP.",
        });
      }
    }

    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  } catch (ex) {
    console.error("checkBookingOtp Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 83. Complete Ride (PHP: ApiController::fiftySeven -> 'complete-ride')
exports.completeRide = async (req, res) => {
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

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const driverCriteria = [
      driver._id,
      driver._id.toString(),
      ...(driver.id ? [driver.id, String(driver.id)] : []),
      ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
    ];

    const trip = await DriverCheckBooking.findOne({
      driver_id: { $in: driverCriteria },
      accept_status: { $in: [1, "1"] },
      arrive_status: { $in: [1, "1"] },
    }).sort({ created_at: -1, createdAt: -1, _id: -1 });

    if (!trip) {
      return res.status(404).json({
        message: "No booking records found for this driver",
      });
    }

    trip.arrive_status = "2";
    trip.updated_at = new Date();
    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Ride Completed successfully",
      trip_id: trip._id ? String(trip._id) : trip.id,
      arrive_status: Number(trip.arrive_status),
    });
  } catch (ex) {
    console.error("completeRide Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

/**
 * Function 96: getDriverCompletedCancelRides
 * PHP: seventy
 * Route: GET /api/get-driver-completed-cancel-rides
 */
exports.getDriverCompletedCancelRides = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const driverCriteria = [driver._id];
    if (driver.id) driverCriteria.push(driver.id);
    if (driver.driver_id) driverCriteria.push(driver.driver_id);
    try {
      driverCriteria.push(String(driver._id));
    } catch (e) {}

    const type = req.query?.type !== undefined ? req.query.type : req.body?.type;
    const date = req.query?.date || req.body?.date;

    let dateQuery = null;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      dateQuery = {
        $or: [
          { created_at: { $gte: startOfDay, $lte: endOfDay } },
          { createdAt: { $gte: startOfDay, $lte: endOfDay } },
        ],
      };
    }

    const formatRideItem = async (items, isCanceled = false) => {
      let user = null;
      if (items.user_id) {
        user = await User.findOne({
          $or: [
            ...(mongoose.isValidObjectId(items.user_id) ? [{ _id: items.user_id }] : []),
            { id: items.user_id },
            { id: String(items.user_id) },
          ],
        });
      }

      const userDetails = user
        ? {
            id: user._id ? String(user._id) : user.id,
            name: user.name || null,
            number: user.phone || user.mobile || user.number || null,
            image: formatImageUrl(user.image, req),
          }
        : [];

      let address = null;
      if (items.address_id) {
        address = await SendLocation.findOne({
          $or: [
            ...(mongoose.isValidObjectId(items.address_id) ? [{ _id: items.address_id }] : []),
            { id: items.address_id },
            { id: String(items.address_id) },
          ],
        }).lean();
      }
      if (!address && items.user_id) {
        address = await SendLocation.findOne({
          $or: [
            { user_id: items.user_id },
            { user_id: String(items.user_id) },
          ],
        })
          .sort({ createdAt: -1, created_at: -1, _id: -1 })
          .lean();
      }
      if (!address) {
        address = {
          from_address: items.from_address || "",
          destination_address: items.destination_address || "",
          from_latitude: items.from_latitude || null,
          from_longitude: items.from_longitude || null,
          destination_latitude: items.destination_latitude || null,
          destination_longitude: items.destination_longitude || null,
        };
      }

      const createdAt = items.created_at || items.createdAt;
      const updatedAt = items.updated_at || items.updatedAt;

      const formattedAddress = {
        ...address,
        id: address && address._id ? String(address._id) : (address && address.id) || null,
        price: items.price !== undefined ? items.price : "0",
        distance: items.distance !== undefined ? items.distance : 0,
        created_att: createdAt
          ? new Date(createdAt).toISOString().replace("T", " ").substring(0, 19)
          : null,
        time:
          createdAt && updatedAt
            ? `${Math.max(1, Math.round(Math.abs(new Date(updatedAt) - new Date(createdAt)) / 60000))} minutes`
            : null,
      };

      if (isCanceled) {
        if (items.reason_id) {
          const reasonIds = String(items.reason_id)
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean);
          const reasonDocs = await CancelReason.find({
            $or: [
              { _id: { $in: reasonIds.filter((id) => mongoose.isValidObjectId(id)) } },
              { id: { $in: reasonIds } },
              { mysqlId: { $in: reasonIds.map(Number).filter((n) => !isNaN(n)) } },
            ],
          }).lean();
          formattedAddress.reasons = reasonDocs.map((r) => r.reason);
        } else {
          formattedAddress.reasons = [];
        }
      }

      return {
        user_details: userDetails,
        address: formattedAddress,
      };
    };

    let getDetails = [];

    if (String(type) === "0") {
      const activeRides = await DriverCheckBooking.find({
        driver_id: { $in: driverCriteria },
        arrive_status: { $in: [0, "0"] },
        accept_status: { $in: [1, "1"] },
      }).sort({ created_at: -1, createdAt: -1, _id: -1 });

      if (activeRides.length > 0) {
        const lastRide = activeRides[0];
        const canceledRides = activeRides.slice(1);

        for (const ride of canceledRides) {
          ride.accept_status = "2";
          await ride.save();

          try {
            const user = await User.findOne({
              $or: [
                ...(mongoose.isValidObjectId(ride.user_id) ? [{ _id: ride.user_id }] : []),
                { id: ride.user_id },
                { id: String(ride.user_id) },
              ],
            });
            if (user) {
              const userName = user.name || "User";
              const userNumber = user.phone || user.mobile || user.number || "";
              const title = "Booking Canceled";
              const body = `Dear ${userName}, your booking has been canceled. Please contact support for more details.`;
              const fcmToken = user.reg_id || user.fcm_token || user.fcmToken;
              if (fcmToken && fcmService && typeof fcmService.sendPushNotification === "function") {
                await fcmService.sendPushNotification(fcmToken, title, body, {
                  type: "booking_canceled",
                  booking_id: String(ride._id || ride.id),
                }).catch(() => {});
              }
            }
          } catch (notifErr) {
            console.error("FCM cancel error:", notifErr);
          }
        }

        const formatted = await formatRideItem(lastRide, false);
        getDetails.push(formatted);
      }
    } else if (String(type) === "1") {
      const queryObj = {
        driver_id: { $in: driverCriteria },
        arrive_status: { $in: [2, "2"] },
      };
      if (dateQuery) {
        Object.assign(queryObj, dateQuery);
      }
      const completedRides = await DriverCheckBooking.find(queryObj).sort({
        created_at: -1,
        createdAt: -1,
        _id: -1,
      });

      for (const ride of completedRides) {
        const formatted = await formatRideItem(ride, false);
        getDetails.push(formatted);
      }
    } else if (String(type) === "2") {
      const queryObj = {
        driver_id: { $in: driverCriteria },
        accept_status: { $in: [2, "2"] },
      };
      if (dateQuery) {
        Object.assign(queryObj, dateQuery);
      }
      const canceledRides = await DriverCheckBooking.find(queryObj).sort({
        created_at: -1,
        createdAt: -1,
        _id: -1,
      });

      for (const ride of canceledRides) {
        const formatted = await formatRideItem(ride, true);
        getDetails.push(formatted);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Booking History Get Successfully",
      details: getDetails,
    });
  } catch (ex) {
    console.error("getDriverCompletedCancelRides error:", ex);
    return res.status(404).json({
      success: false,
      message: "This type Booking not found",
    });
  }
};

/**
 * Function 97: driverRechargeWallet
 * PHP: seventyOne
 * Route: POST /api/driver-recharge-wallet
 */
exports.driverRechargeWallet = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const rechargeAmount = Math.abs(Number(req.body?.amount !== undefined ? req.body.amount : req.query?.amount) || 0);
    const transac_id = req.body?.payment_id || req.body?.transaction_id || req.query?.payment_id || null;

    // Wallet Recharge Entry
    const wallet = await DriverWalletRecharge.create({
      driver_id: driver._id ? String(driver._id) : driver.id,
      amount: "+" + rechargeAmount,
      status: "2",
      transaction_id: transac_id,
    });

    // Update Driver Wallet
    const currentBalance = Number(driver.wallet) || 0;
    const newWalletBalance = currentBalance + rechargeAmount;
    driver.wallet = newWalletBalance;
    await driver.save();

    // Referral Commission
    if (driver.referByCode) {
      const commissionPercent = 5;
      const commissionAmount = (rechargeAmount * commissionPercent) / 100;

      await DriverCommisionReferBy.create({
        driverWalletRechargeId: wallet._id ? String(wallet._id) : wallet.id,
        driver_id: driver._id ? String(driver._id) : driver.id,
        referByCode: driver.referByCode,
        amount: rechargeAmount,
        commisionInPercent: commissionPercent,
        commisionAmount: commissionAmount,
        status: "0",
      });
    }

    // Sub Admin Commission
    if (driver.state) {
      const subAdmin = await SubAdmin.findOne({
        state: new RegExp(`^${driver.state.trim()}$`, "i"),
      });

      if (subAdmin) {
        const commissionPercent = Number(subAdmin.commission) || 0;
        const commissionAmount = (rechargeAmount * commissionPercent) / 100;

        await SubAdminCommission.create({
          driverWalletRechargeId: wallet._id ? String(wallet._id) : wallet.id,
          driverId: driver._id ? String(driver._id) : driver.id,
          subAdminId: subAdmin._id ? String(subAdmin._id) : subAdmin.id,
          amount: rechargeAmount,
          commissionPercent: commissionPercent,
          commissionAmount: commissionAmount,
        });
      }
    }

    return res.status(200).json({
      message: "Recharge Successful",
      new_wallet_balance: newWalletBalance,
    });
  } catch (ex) {
    console.error("driverRechargeWallet error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 98: getDriverRechargeHistory
 * PHP: seventyTwo
 * Route: GET /api/get-recharge-history
 */
exports.getDriverRechargeHistory = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const driverCriteria = [driver._id];
    if (driver.id) driverCriteria.push(driver.id);
    if (driver.driver_id) driverCriteria.push(driver.driver_id);
    try {
      driverCriteria.push(String(driver._id));
    } catch (e) {}

    const rechargeHistory = await DriverWalletRecharge.find({
      driver_id: { $in: driverCriteria },
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    const walletBalance = driver.wallet !== undefined ? driver.wallet : 0;

    return res.status(200).json({
      message: "Recharge history fetched successfully",
      wallet_balance: walletBalance,
      recharge_history: rechargeHistory,
    });
  } catch (ex) {
    console.error("getDriverRechargeHistory error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 99: getBankList
 * PHP: seventyThree
 * Route: GET /api/get-bank-list
 */
exports.getBankList = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const banks = await Bank.find().sort({ created_at: -1, createdAt: -1, _id: -1 }).lean();

    return res.status(200).json({
      message: "Bank list fetched successfully",
      Data: banks,
    });
  } catch (ex) {
    console.error("getBankList error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 100: driverSaveAccountDetails
 * PHP: seventyfour
 * Route: POST /api/driver-save-account-details
 */
exports.driverSaveAccountDetails = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const accountNumber = req.body?.account_number || req.query?.account_number;
    const bankId = req.body?.bank_id || req.query?.bank_id;
    const holderName = req.body?.holder_name || req.query?.holder_name;
    const ifscCode = req.body?.ifsc_code || req.query?.ifsc_code;

    const existingAccount = await DriverAccount.findOne({
      account_number: accountNumber,
    });

    if (existingAccount) {
      return res.status(200).json({
        success: false,
        message: "Account number already exists",
      });
    }

    const driverAccount = await DriverAccount.create({
      driver_id: driver._id ? String(driver._id) : driver.id,
      bank_id: bankId,
      holder_name: holderName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
    });

    return res.status(201).json({
      message: "Driver account saved successfully",
      data: driverAccount,
    });
  } catch (ex) {
    console.error("driverSaveAccountDetails error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 101: getDriverAccountDetails
 * PHP: seventyfive
 * Route: GET /api/get-driver-account-details
 */
exports.getDriverAccountDetails = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const driverCriteria = [driver._id];
    if (driver.id) driverCriteria.push(driver.id);
    if (driver.driver_id) driverCriteria.push(driver.driver_id);
    try {
      driverCriteria.push(String(driver._id));
    } catch (e) {}

    const driverAccounts = await DriverAccount.find({
      driver_id: { $in: driverCriteria },
    }).lean();

    const formattedAccounts = await Promise.all(
      driverAccounts.map(async (account) => {
        let bank = null;
        if (account.bank_id) {
          bank = await Bank.findOne({
            $or: [
              ...(mongoose.isValidObjectId(account.bank_id) ? [{ _id: account.bank_id }] : []),
              { id: account.bank_id },
              { id: String(account.bank_id) },
              { mysqlId: Number(account.bank_id) || -1 },
            ],
          }).lean();
        }

        return {
          account_id: account._id ? String(account._id) : account.id,
          holder_name: account.holder_name,
          account_number: account.account_number,
          ifsc_code: account.ifsc_code,
          bank: {
            bank_id: bank ? (bank._id ? String(bank._id) : bank.id) : null,
            bank_name: bank ? bank.bank_name : null,
            bank_image: bank ? (bank.image_url || bank.image || null) : null,
          },
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: "Driver account details retrieved successfully",
      data: formattedAccounts,
    });
  } catch (ex) {
    console.error("getDriverAccountDetails error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 102: driverWithdrawRequest
 * PHP: seventySix
 * Route: POST /api/driver-withdraw-request
 */
exports.driverWithdrawRequest = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const wallet = Number(driver.wallet) || 0;
    const amount = Number(req.body?.amount !== undefined ? req.body.amount : req.query?.amount) || 0;
    const accountId = req.body?.account_id || req.query?.account_id;

    if (wallet < amount) {
      return res.status(400).json({
        message: "Insufficient funds",
      });
    }

    driver.wallet = wallet - amount;
    await driver.save();

    const withdraw = await DriverWithdrawRequest.create({
      driver_id: driver._id ? String(driver._id) : driver.id,
      account_id: accountId,
      amount: amount,
    });

    const transactionId = "TXN_" + Date.now() + "_" + Math.floor(1000 + Math.random() * 9000);
    await DriverWalletRecharge.create({
      driver_id: driver._id ? String(driver._id) : driver.id,
      amount: "-" + amount,
      status: "1", // 1 = Sent Request / Withdrawal
      transaction_id: transactionId,
    });

    return res.status(201).json({
      message: "Withdraw request sent successfully",
      data: withdraw,
    });
  } catch (ex) {
    console.error("driverWithdrawRequest error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 103: getDriverPaymentHistory
 * PHP: seventySeven
 * Route: GET /api/get-driver-payment-history
 */
exports.getDriverPaymentHistory = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const type = req.query?.type !== undefined ? req.query.type : req.body?.type;
    const validTypes = [0, 1, 2, "0", "1", "2"];
    if (type === undefined || !validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid type provided. Accepted values are 0, 1, or 2.",
      });
    }

    const driverCriteria = [driver._id];
    if (driver.id) driverCriteria.push(driver.id);
    if (driver.driver_id) driverCriteria.push(driver.driver_id);
    try {
      driverCriteria.push(String(driver._id));
    } catch (e) {}

    const typeNum = Number(type);
    const paymentHistory = await DriverWalletRecharge.find({
      driver_id: { $in: driverCriteria },
      status: { $in: [typeNum, String(typeNum)] },
    })
      .sort({ created_at: -1, createdAt: -1, _id: -1 })
      .lean();

    const typeNames = {
      0: "Credit",
      1: "Sent Request",
      2: "Deposit",
      "0": "Credit",
      "1": "Sent Request",
      "2": "Deposit",
    };

    const formattedHistory = await Promise.all(
      paymentHistory.map(async (record) => {
        const item = { ...record };
        item.payment_type = typeNames[record.status] || "Unknown";

        const createdAt = record.created_at || record.createdAt;
        if (createdAt) {
          const d = new Date(createdAt);
          const pad = (n) => String(n).padStart(2, "0");
          item.created_at_formatted = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
        } else {
          item.created_at_formatted = "";
        }

        if (Number(record.status) === 0) {
          let user = null;
          if (record.user_id) {
            user = await User.findOne({
              $or: [
                ...(mongoose.isValidObjectId(record.user_id) ? [{ _id: record.user_id }] : []),
                { id: record.user_id },
                { id: String(record.user_id) },
              ],
            }).lean();
          }
          item.user_name = user ? user.name : "Unknown User";
        } else {
          item.driver_name = driver.name;
        }

        return item;
      })
    );

    return res.status(200).json({
      success: true,
      message: "Driver payment history retrieved successfully",
      data: formattedHistory,
    });
  } catch (ex) {
    console.error("getDriverPaymentHistory error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 104: getDriverEarnings
 * PHP: seventyEight
 * Route: GET /api/get-driver-earning
 */
exports.getDriverEarnings = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const driverCriteria = [driver._id];
    if (driver.id) driverCriteria.push(driver.id);
    if (driver.driver_id) driverCriteria.push(driver.driver_id);
    try {
      driverCriteria.push(String(driver._id));
    } catch (e) {}

    // Date boundaries
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Carbon::now()->startOfWeek() (Monday 00:00:00)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay(); // 0 is Sun, 1 is Mon
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // Carbon::now()->startOfMonth() (1st day of month 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const allRecharges = await DriverWalletRecharge.find({
      driver_id: { $in: driverCriteria },
    }).lean();

    let todayEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;
    let totalEarnings = 0;
    let totalWithdrawAmount = 0;

    for (const r of allRecharges) {
      const amt = Number(String(r.amount || 0).replace(/[^0-9.-]/g, "")) || 0;
      const statusNum = Number(r.status);
      const createdAt = new Date(r.created_at || r.createdAt || 0);

      if (statusNum === 0) {
        totalEarnings += amt;

        if (createdAt >= startOfToday) {
          todayEarnings += amt;
        }
        if (createdAt >= startOfWeek && createdAt <= now) {
          weeklyEarnings += amt;
        }
        if (createdAt >= startOfMonth && createdAt <= now) {
          monthlyEarnings += amt;
        }
      } else if (statusNum === 1) {
        totalWithdrawAmount += amt;
      }
    }

    return res.status(200).json({
      success: true,
      message: "Driver earnings retrieved successfully",
      earnings: {
        today_earning: todayEarnings.toFixed(2),
        weekly_earning: weeklyEarnings.toFixed(2),
        monthly_earning: monthlyEarnings.toFixed(2),
        total_earning: totalEarnings.toFixed(2),
        total_withdraw_amount: Math.abs(totalWithdrawAmount).toFixed(2),
      },
    });
  } catch (ex) {
    console.error("getDriverEarnings error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 105: updateDriverLocation
 * PHP: seventyNine
 * Route: POST /api/update-driver-location
 */
exports.updateDriverLocation = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid driver token" });
    }

    const latitude = req.body?.latitude !== undefined ? req.body.latitude : req.query?.latitude;
    const longitude = req.body?.longitude !== undefined ? req.body.longitude : req.query?.longitude;

    if (latitude === undefined || longitude === undefined || latitude === "" || longitude === "") {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: {
          ...(!latitude ? { latitude: ["The latitude field is required."] } : {}),
          ...(!longitude ? { longitude: ["The longitude field is required."] } : {}),
        },
      });
    }

    driver.latitude = String(latitude);
    driver.longitude = String(longitude);
    await driver.save();

    return res.status(200).json({
      message: "Driver location updated successfully",
      data: {
        latitude: driver.latitude,
        longitude: driver.longitude,
      },
    });
  } catch (ex) {
    console.error("updateDriverLocation error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

/**
 * Function 108: checkDriverToken
 * PHP: driverTokenCheck
 * Route: GET /api/check-token-driver
 */
exports.checkDriverToken = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (driver) {
      return res.status(200).json({
        message: "the driver exist",
      });
    } else {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }
  } catch (ex) {
    console.error("checkDriverToken error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

/**
 * Function 110: documentAgainUploadAndVerify
 * PHP: eightyThree
 * Route: POST /api/document-again-upload-and-verify
 */
exports.documentAgainUploadAndVerify = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({ message: "Invalid user token" });
    }

    const body = req.body || {};

    const fileMap = {};
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        fileMap[file.fieldname] = `uploads/drivers/${file.filename}`;
      }
    }

    if (fileMap.image || body.image) driver.image = fileMap.image || body.image;
    if (fileMap.id_proof_front || body.id_proof_front) driver.id_proof_front = fileMap.id_proof_front || body.id_proof_front;
    if (fileMap.id_proof_back || body.id_proof_back) driver.id_proof_back = fileMap.id_proof_back || body.id_proof_back;
    if (fileMap.insurence_front || body.insurence_front) driver.insurence_front = fileMap.insurence_front || body.insurence_front;
    if (fileMap.insurence_back || body.insurence_back) driver.insurence_back = fileMap.insurence_back || body.insurence_back;
    if (fileMap.driving_licence_front || body.driving_licence_front) driver.driving_licence_front = fileMap.driving_licence_front || body.driving_licence_front;
    if (fileMap.driving_licence_back || body.driving_licence_back) driver.driving_licence_back = fileMap.driving_licence_back || body.driving_licence_back;
    if (fileMap.vehicle_rc_front || body.vehicle_rc_front) driver.vehicle_rc_front = fileMap.vehicle_rc_front || body.vehicle_rc_front;
    if (fileMap.vehicle_rc_back || body.vehicle_rc_back) driver.vehicle_rc_back = fileMap.vehicle_rc_back || body.vehicle_rc_back;
    if (fileMap.vehicle_front_image || body.vehicle_front_image) driver.vehicle_front_image = fileMap.vehicle_front_image || body.vehicle_front_image;
    if (fileMap.vehicle_back_image || body.vehicle_back_image) driver.vehicle_back_image = fileMap.vehicle_back_image || body.vehicle_back_image;

    if (body.cateogory !== undefined) driver.cateogory = body.cateogory;
    if (body.category !== undefined && body.cateogory === undefined) driver.cateogory = body.category;
    if (body.brand !== undefined) driver.brand = body.brand;
    if (body.model !== undefined) driver.model = body.model;
    if (body.color !== undefined) driver.color = body.color;
    if (body.manufacturing_year !== undefined) driver.manufacturing_year = body.manufacturing_year;
    if (body.license_number !== undefined) driver.license_number = body.license_number;

    driver.document_verify_status = "0";
    driver.register = "1";
    await driver.save();

    return res.status(200).json({
      message: "Updated Successfully",
    });
  } catch (ex) {
    console.error("documentAgainUploadAndVerify error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

/**
 * Function 118: getDriverReferralCode
 * PHP: eightyFive
 * Route: GET /api/get-driver-referal-code
 */
exports.getDriverReferralCode = async (req, res) => {
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

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    let referalCode = driver.referalCode;
    if (!referalCode) {
      const numPart = driver.number ? driver.number.slice(-4) : Math.floor(1000 + Math.random() * 9000);
      referalCode = `BC${numPart}`;
      driver.referalCode = referalCode;
      await driver.save();
    }

    const message = `Hey! Join me on the Bhrosa Driver App – a trusted platform for drivers to earn more and drive smarter. Use my referral code ${referalCode} when signing up to get exclusive benefits! Download the app now and start your journey with Bhrosa Driver 🚗📲`;

    return res.status(200).json({
      message: message,
      referalCode: referalCode,
      link: "https://play.google.com/store/apps/details?id=com.barosa.cab",
    });
  } catch (ex) {
    console.error("getDriverReferralCode error:", ex);
    return res.status(500).json({
      message: "Server Error",
      details: ex.message,
    });
  }
};

/**
 * Function 120: getReferralByDriverList
 * PHP: eightySeven
 * Route: GET /api/get-referal-by-driver-list
 */
exports.getReferralByDriverList = async (req, res) => {
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

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const referalCode = driver.referalCode;
    let list = [];
    if (referalCode) {
      list = await Driver.find({
        _id: { $ne: driver._id },
        referByCode: referalCode,
      }).select("name last_name lastName email number mobile_number image referalCode");
    }

    const formattedList = list.map((item) => ({
      name: item.name || "",
      last_name: item.last_name || item.lastName || "",
      email: item.email || "",
      number: item.number || item.mobile_number || "",
      image: item.image ? formatImageUrl(item.image, req) : null,
      referalCode: item.referalCode || "",
    }));

    return res.status(200).json({
      message: "List Get Successfully",
      details: formattedList,
    });
  } catch (ex) {
    console.error("getReferralByDriverList error:", ex);
    return res.status(500).json({
      message: "Server Error",
      details: ex.message,
    });
  }
};

/**
 * Function 121: driverTopupAlert
 * PHP: driver_topup_alert
 * Route: ALL /api/driver-topup-alert
 */
exports.driverTopupAlert = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        status: false,
        message: "Invalid request method",
      });
    }

    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Token not provided",
      });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        status: false,
        message: "Invalid user token",
      });
    }

    const cat = driver.cateogory !== undefined ? driver.cateogory : driver.category;
    let topupAlert = null;

    if (cat !== undefined && cat !== null && cat !== "") {
      const topupConditions = [];
      if (!isNaN(cat)) {
        topupConditions.push({ carTypeId: Number(cat) });
        topupConditions.push({ mysqlId: Number(cat) });
      }
      if (mongoose.Types.ObjectId.isValid(cat)) {
        topupConditions.push({ carType: cat });
        topupConditions.push({ _id: cat });
      }

      // Also find CarType by name or ID
      const matchingCarType = await CarType.findOne({
        $or: [
          { typeName: String(cat).trim() },
          { mysqlId: !isNaN(cat) ? Number(cat) : -1 },
        ],
      });

      if (matchingCarType) {
        topupConditions.push({ carType: matchingCarType._id });
        topupConditions.push({ carTypeId: matchingCarType.mysqlId });
      }

      if (topupConditions.length > 0) {
        topupAlert = await DriverTopup.findOne({ $or: topupConditions });
      }
    }

    // Fallback: If category not set or not matched, take the first available default slab
    if (!topupAlert) {
      topupAlert = await DriverTopup.findOne().sort({ carTypeId: 1, mysqlId: 1 });
    }

    if (!topupAlert) {
      return res.status(200).json({
        status: true,
        message: "No top-up alert found",
        need_topup: false,
      });
    }

    const walletBalance = Number(driver.wallet || 0);
    const topupAmount = Number(
      topupAlert.topupAmount !== undefined
        ? topupAlert.topupAmount
        : topupAlert.topup_amount || 0
    );

    if (walletBalance < topupAmount) {
      return res.status(200).json({
        status: true,
        need_topup: true,
        message: "Your wallet balance is low. Please top-up to continue.",
        wallet: walletBalance,
        required_min: topupAmount,
      });
    }

    return res.status(200).json({
      status: true,
      need_topup: false,
      message: "Wallet balance is sufficient",
      wallet: walletBalance,
    });
  } catch (ex) {
    console.error("Driver Topup Alert Error:", ex);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};
exports.getDriverTopupAlert = exports.driverTopupAlert;

/**
 * Function 122: driverTestLogin
 * PHP: testLogin
 * Route: ALL /api/test-login
 */
exports.driverTestLogin = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Invalid Method",
    });
  }

  const number = req.body?.number;
  if (!number || String(number).trim() === "") {
    return res.status(400).json({
      message: "NUMBER_REQUIRED",
    });
  }

  try {
    const cleanNum = String(number).trim();
    const driver = await Driver.findOne({
      $or: [
        { number: cleanNum },
        { mobile_number: cleanNum },
        { phone: cleanNum },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    if (String(driver.block_status) === "1" || driver.block_status === 1 || driver.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked",
      });
    }

    const crypto = require("crypto");
    const token = crypto.randomBytes(32).toString("hex");

    driver.token = token;
    driver.active_status = 0;
    driver.reg_id = req.body?.reg_id || null;
    await driver.save();

    return res.status(200).json({
      message: "LOGIN SUCCESSFULLY",
      token: token,
      register: driver.register !== undefined ? driver.register : 1,
      active_status: String(driver.active_status),
      status: driver.status !== undefined ? Number(driver.status) : 1,
      block_status: driver.block_status !== undefined ? Number(driver.block_status) : 0,
    });
  } catch (ex) {
    console.error("Error in Number Login:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: "Please contact support.",
    });
  }
};
exports.testLogin = exports.driverTestLogin;

/**
 * Function 127: deleteDriverAccount
 * PHP: deleteDriverAccount
 * Route: ALL /api/delete-driver-account
 */
exports.deleteDriverAccount = async (req, res) => {
  try {
    const token = req.headers.token || req.header("token");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const driver = await Driver.findOne({
      $or: [
        { token: token },
        { api_token: token },
        { remember_token: token },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    // All image/document fields
    const files = [
      driver.image,
      driver.id_proof_front,
      driver.id_proof_back,
      driver.driving_licence_front,
      driver.driving_licence_back,
      driver.vehicle_rc_front,
      driver.vehicle_rc_back,
      driver.vehicle_front_image,
      driver.vehicle_back_image,
      driver.vehicle_interior_image,
      driver.government_id_proof,
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

    await Driver.deleteOne({ _id: driver._id });

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (e) {
    console.error("deleteDriverAccount error:", e);
    return res.status(500).json({
      message: "Server error",
      error: e.message,
    });
  }
};

/**
 * Driver Account Deleted
 * Route: ALL /api/driver-account-deleted, /api/driver-account-delete, /api/driver-delete-account
 */
exports.driverAccountDeleted = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (e) {
    console.error("driverAccountDeleted error:", e);
    return res.status(500).json({
      message: "Server error",
      error: e.message,
    });
  }
};
exports.driverAccountDelete = exports.driverAccountDeleted;






