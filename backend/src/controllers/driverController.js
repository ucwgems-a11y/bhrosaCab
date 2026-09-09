/**
 * Driver Controller
 * Handles driver registration, authentication, profile, wallet, and admin management.
 */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");
const DriverWalletRecharge = require("../models/DriverWalletRecharge");
const DriverTopup = require("../models/DriverTopup");
const DriverCommisionReferBy = require("../models/DriverCommisionReferBy");
const Ride = require("../models/Ride");
const User = require("../models/User");
const CarType = require("../models/CarType");

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
    // Branch B: Mobile App Self-Logout
    // -------------------------------------------------------------
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
        status: false,
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
        status: false,
        message: "Invalid driver token",
      });
    }

    // Clear active session, token, registration ID, and set offline
    driver.token = null;
    driver.reg_id = null;
    driver.active_status = 0;
    await driver.save();

    console.log(
      `🔒 [APP LOGOUT] Driver self logged out successfully: ${driver.name} (${driver.number})`,
    );

    return res.status(200).json({
      status: true,
      message: "Logout Successfully",
    });
  } catch (error) {
    console.error("logoutDriver Error:", error);
    return res.status(500).json({
      status: false,
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
