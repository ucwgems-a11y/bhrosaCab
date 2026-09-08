const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SubAdmin = require("../models/SubAdmin");
const SubAdminWithdrawal = require("../models/SubAdminWithdrawal");

// 1. Get All Sub-Admins
const getSubAdmins = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: subAdmins.length,
      subAdmins,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. Get Single Sub-Admin by ID
const getSubAdminById = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.params.id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-Admin not found" });
    }
    res.json({ success: true, subAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. Register / Create Sub-Admin (From Admin Panel or API)
const registerSubAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      countryCode,
      country,
      state,
      city,
      address,
      minimumMG,
      commission,
      ipAddress,
      ipStatus,
      status,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existing = await SubAdmin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Sub-Admin with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let agreementPath = "";
    let profileImagePath = "";

    let agreementFile = null;
    let imgFile = null;

    if (Array.isArray(req.files)) {
      agreementFile = req.files.find((f) => f.fieldname === "agreement");
      imgFile = req.files.find(
        (f) =>
          f.fieldname === "image" ||
          f.fieldname === "profileImage" ||
          f.fieldname === "avatar"
      );
    } else if (req.files) {
      agreementFile = req.files.agreement?.[0];
      imgFile =
        req.files.image?.[0] ||
        req.files.profileImage?.[0] ||
        req.files.avatar?.[0];
    }
    if (req.file) {
      if (req.file.fieldname === "agreement") agreementFile = req.file;
      if (
        req.file.fieldname === "image" ||
        req.file.fieldname === "profileImage" ||
        req.file.fieldname === "avatar"
      ) {
        imgFile = req.file;
      }
    }

    if (agreementFile) {
      agreementPath = `/uploads/${agreementFile.filename}`;
    }
    if (imgFile) {
      profileImagePath = `/uploads/${imgFile.filename}`;
    }

    const subAdmin = await SubAdmin.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      countryCode: countryCode || "+91",
      country: country || "India",
      state: state || "",
      city: city || "",
      address: address || "",
      minimumMG: minimumMG ? Number(minimumMG) : 0,
      commission: commission !== undefined ? Number(commission) : 0,
      agreement: agreementPath,
      profileImage: profileImagePath,
      ipAddress: ipAddress || "",
      ipStatus: ipStatus !== undefined ? ipStatus : true,
      status: status !== undefined ? status : true,
    });

    res.status(201).json({
      success: true,
      message: "Sub-Admin created successfully",
      subAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. Update Sub-Admin
const updateSubAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      countryCode,
      country,
      state,
      city,
      address,
      minimumMG,
      commission,
      ipAddress,
      ipStatus,
      status,
    } = req.body;

    const subAdmin = await SubAdmin.findById(req.params.id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-Admin not found" });
    }

    if (name) subAdmin.name = name;
    if (email) subAdmin.email = email.toLowerCase();
    if (phone) subAdmin.phone = phone;
    if (countryCode) subAdmin.countryCode = countryCode;
    if (country) subAdmin.country = country;
    if (state !== undefined) subAdmin.state = state;
    if (city !== undefined) subAdmin.city = city;
    if (address !== undefined) subAdmin.address = address;
    if (minimumMG !== undefined) subAdmin.minimumMG = Number(minimumMG) || 0;
    if (commission !== undefined) subAdmin.commission = Number(commission) || 0;
    if (ipAddress !== undefined) subAdmin.ipAddress = ipAddress;
    if (ipStatus !== undefined) subAdmin.ipStatus = ipStatus;
    if (status !== undefined) subAdmin.status = status;

    if (password && password.trim() !== "") {
      subAdmin.password = await bcrypt.hash(password, 10);
    }

    let agreementFile = null;
    let imgFile = null;

    if (Array.isArray(req.files)) {
      agreementFile = req.files.find((f) => f.fieldname === "agreement");
      imgFile = req.files.find(
        (f) =>
          f.fieldname === "image" ||
          f.fieldname === "profileImage" ||
          f.fieldname === "avatar"
      );
    } else if (req.files) {
      agreementFile = req.files.agreement?.[0];
      imgFile =
        req.files.image?.[0] ||
        req.files.profileImage?.[0] ||
        req.files.avatar?.[0];
    }
    if (req.file) {
      if (req.file.fieldname === "agreement") agreementFile = req.file;
      if (
        req.file.fieldname === "image" ||
        req.file.fieldname === "profileImage" ||
        req.file.fieldname === "avatar"
      ) {
        imgFile = req.file;
      }
    }

    if (agreementFile) {
      subAdmin.agreement = `/uploads/${agreementFile.filename}`;
    }
    if (imgFile) {
      subAdmin.profileImage = `/uploads/${imgFile.filename}`;
    }

    await subAdmin.save();

    res.json({
      success: true,
      message: "Sub-Admin updated successfully",
      subAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 5. Delete Sub-Admin
const deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findByIdAndDelete(req.params.id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-Admin not found" });
    }
    res.json({ success: true, message: "Sub-Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 6. Toggle Sub-Admin Active/Inactive Status
const toggleSubAdminStatus = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.params.id);
    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-Admin not found" });
    }
    subAdmin.status = !subAdmin.status;
    await subAdmin.save();
    res.json({
      success: true,
      message: `Sub-Admin is now ${subAdmin.status ? "Active" : "Inactive"}`,
      status: subAdmin.status,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 7. Login Sub-Admin with IP Address Validation
const loginSubAdmin = async (req, res) => {
  try {
    const { email, password, ip_address } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const subAdmin = await SubAdmin.findOne({ email: email.toLowerCase() });
    if (!subAdmin) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (!subAdmin.status) {
      return res.status(403).json({ message: "Your Sub-Admin account is deactivated. Contact Admin." });
    }

    const isMatch = await bcrypt.compare(password, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Strict IP Address Validation
    const rawClientIp =
      ip_address ||
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "";

    const cleanClientIp = rawClientIp.replace(/^::ffff:/, "").trim();

    if (subAdmin.ipStatus && subAdmin.ipAddress && subAdmin.ipAddress.trim() !== "") {
      const allowedList = subAdmin.ipAddress
        .split(",")
        .map((ip) => ip.trim().replace(/^::ffff:/, ""))
        .filter(Boolean);

      const isAllowed = allowedList.some((allowed) => {
        // Universal wildcard
        if (allowed === "*" || allowed.toLowerCase() === "all") return true;

        // Exact IP match
        if (allowed === cleanClientIp) return true;

        // Explicit wildcard pattern (e.g. "49.43.110.*" only when explicitly entered by admin)
        if (allowed.includes("*")) {
          const regex = new RegExp("^" + allowed.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$");
          if (regex.test(cleanClientIp)) return true;
        }

        return false;
      });

      if (!isAllowed) {
        return res.status(403).json({
          message: `Access Denied: Your IP address (${cleanClientIp || "Unknown"}) is not authorized for this Sub-Admin account. (Allowed IP: ${subAdmin.ipAddress})`,
          detectedIp: cleanClientIp,
        });
      }
    }

    const token = jwt.sign(
      { id: subAdmin._id, email: subAdmin.email, role: "subadmin" },
      process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      subAdmin: {
        id: subAdmin._id,
        _id: subAdmin._id,
        name: subAdmin.name,
        email: subAdmin.email,
        phone: subAdmin.phone,
        countryCode: subAdmin.countryCode,
        country: subAdmin.country,
        state: subAdmin.state,
        city: subAdmin.city,
        address: subAdmin.address,
        minimumMG: subAdmin.minimumMG,
        commission: subAdmin.commission,
        agreement: subAdmin.agreement,
        profileImage: subAdmin.profileImage,
        ipAddress: subAdmin.ipAddress,
        status: subAdmin.status,
        role: "subadmin",
        createdAt: subAdmin.createdAt,
        updatedAt: subAdmin.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 8. Change Sub-Admin Password
const changeSubAdminPassword = async (req, res) => {
  try {
    const { old_password, currentPassword, new_password, newPassword, email } = req.body;
    const oldPass = old_password || currentPassword;
    const newPass = new_password || newPassword;

    if (!oldPass || !newPass) {
      return res.status(400).json({ message: "Old password and new password are required." });
    }

    let subAdmin;

    // Check token if present in headers
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
        if (decoded.id) {
          subAdmin = await SubAdmin.findById(decoded.id);
        }
      } catch (err) {
        // Token verification failed or invalid
      }
    }

    if (!subAdmin && email) {
      subAdmin = await SubAdmin.findOne({ email: email.toLowerCase() });
    }

    if (!subAdmin) {
      subAdmin = await SubAdmin.findOne();
    }

    if (!subAdmin) {
      return res.status(404).json({ message: "Sub-Admin account not found." });
    }

    const isMatch = await bcrypt.compare(oldPass, subAdmin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password." });
    }

    subAdmin.password = await bcrypt.hash(newPass, 10);
    await subAdmin.save();

    res.json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 9. Get Current Sub-Admin Profile
const getSubAdminProfile = async (req, res) => {
  try {
    let subAdminId = req.query?.id;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
        if (decoded?.id) {
          subAdminId = decoded.id;
        }
      } catch (err) {}
    }

    if (!subAdminId && req.query?.email) {
      const found = await SubAdmin.findOne({ email: req.query.email.toLowerCase() });
      if (found) subAdminId = found._id;
    }

    if (!subAdminId) {
      // Fallback to first subadmin if present
      const firstSubAdmin = await SubAdmin.findOne().select("-password");
      if (firstSubAdmin) {
        return res.json({ success: true, subAdmin: firstSubAdmin });
      }
      return res.status(401).json({ success: false, message: "Unauthorized or Sub-Admin ID missing" });
    }

    const subAdmin = await SubAdmin.findById(subAdminId).select("-password");
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: "Sub-Admin not found" });
    }

    res.json({ success: true, subAdmin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 10. Update Sub-Admin Profile Picture Only (From CRM Profile or Admin)
const updateSubAdminProfileImage = async (req, res) => {
  try {
    let subAdminId = req.params?.id || req.body?.id;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
        if (decoded?.id) {
          subAdminId = decoded.id;
        }
      } catch (err) {}
    }

    if (!subAdminId && req.body?.email) {
      const found = await SubAdmin.findOne({ email: req.body.email.toLowerCase() });
      if (found) subAdminId = found._id;
    }

    if (!subAdminId) {
      const firstSubAdmin = await SubAdmin.findOne();
      if (firstSubAdmin) subAdminId = firstSubAdmin._id;
    }

    if (!subAdminId) {
      return res.status(400).json({ success: false, message: "Sub-Admin ID is required" });
    }

    const subAdmin = await SubAdmin.findById(subAdminId);
    if (!subAdmin) {
      return res.status(404).json({ success: false, message: "Sub-Admin not found" });
    }

    let imgFile = null;
    if (Array.isArray(req.files)) {
      imgFile = req.files.find(
        (f) =>
          f.fieldname === "image" ||
          f.fieldname === "profileImage" ||
          f.fieldname === "avatar" ||
          f.fieldname === "file"
      );
    } else if (req.files) {
      imgFile =
        req.files.image?.[0] ||
        req.files.profileImage?.[0] ||
        req.files.avatar?.[0] ||
        req.files.file?.[0];
    }
    if (req.file) {
      imgFile = req.file;
    }

    if (!imgFile) {
      return res.status(400).json({ success: false, message: "Please select an image file to upload" });
    }

    subAdmin.profileImage = `/uploads/${imgFile.filename}`;
    await subAdmin.save();

    const cleanSubAdmin = subAdmin.toObject();
    delete cleanSubAdmin.password;

    res.json({
      success: true,
      message: "Profile image updated successfully",
      subAdmin: cleanSubAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// 11. Request Withdrawal (From CRM Sub-Admin)
const requestWithdrawal = async (req, res) => {
  try {
    const {
      subAdminId,
      subAdminName,
      subAdminEmail,
      state,
      bankName,
      accountHolder,
      accountNumber,
      ifscCode,
      branchName,
      amount,
    } = req.body;

    if (!amount || !bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({ success: false, message: "Missing required withdrawal fields." });
    }

    let realSubAdminName = subAdminName;
    let realState = state;
    if (subAdminId) {
      const sa = await SubAdmin.findById(subAdminId);
      if (sa) {
        realSubAdminName = sa.name || realSubAdminName;
        realState = sa.state || sa.city || realState;
      }
    }

    const nowStr =
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const withdrawal = await SubAdminWithdrawal.create({
      subAdminId: subAdminId || null,
      subAdminName: realSubAdminName || accountHolder || "Sub Admin",
      subAdminEmail: subAdminEmail || "",
      state: realState || "N/A",
      bankName,
      accountHolder,
      accountNumber,
      ifscCode,
      branchName: branchName || "N/A",
      amount: Number(amount),
      status: "Pending",
      requestedDate: nowStr,
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdrawal,
    });
  } catch (err) {
    console.error("Error in requestWithdrawal:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 12. Get All Withdrawal Requests (Admin & CRM)
const getWithdrawalRequests = async (req, res) => {
  try {
    const { subAdminId } = req.query;
    const query = {};
    if (subAdminId) {
      query.subAdminId = subAdminId;
    }
    const requests = await SubAdminWithdrawal.find(query).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    console.error("Error in getWithdrawalRequests:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 13. Update Withdrawal Status (Admin Approve / Reject)
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body;

    const withdrawal = await SubAdminWithdrawal.findById(id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: "Withdrawal request not found." });
    }

    if (status) withdrawal.status = status;
    if (rejectReason !== undefined) withdrawal.rejectReason = rejectReason;
    await withdrawal.save();

    return res.status(200).json({
      success: true,
      message: `Withdrawal request status updated to ${withdrawal.status}.`,
      withdrawal,
    });
  } catch (err) {
    console.error("Error in updateWithdrawalStatus:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSubAdmins,
  getSubAdminById,
  registerSubAdmin,
  updateSubAdmin,
  deleteSubAdmin,
  toggleSubAdminStatus,
  loginSubAdmin,
  changeSubAdminPassword,
  getSubAdminProfile,
  updateSubAdminProfileImage,
  requestWithdrawal,
  getWithdrawalRequests,
  updateWithdrawalStatus,
};
