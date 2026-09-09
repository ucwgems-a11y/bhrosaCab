const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RegistrationEvent = require("../models/RegistrationEvent");

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
      user = await User.create({
        phone: cleanNumber,
        otp: otp,
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
    user.appToken = token;
    if (reg_id) {
      user.fcmToken = reg_id;
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

    let user = await User.findOne({ appToken: token });

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
    user.fcmToken = null;
    user.isActive = false;
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

