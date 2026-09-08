const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// ⚠️ PRODUCTION SECURITY: Admin self-registration & password reset endpoint is disabled.
/*
const registerAdmin = async (req, res) => {
  try {
    const { name, nickName, email, password, dob, country, gender } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const existing = await Admin.findOne({ email });
    if (existing) {
      existing.password = hashedPassword;
      if (name) existing.name = name;
      if (nickName) existing.nickName = nickName;
      await existing.save();
      return res.status(200).json({
        message: "Admin password reset/updated successfully!",
        admin: { id: existing._id, name: existing.name, email: existing.email },
      });
    }

    const admin = await Admin.create({
      name: name || "Admin",
      nickName: nickName || "Admin",
      email,
      password: hashedPassword,
      dob,
      country,
      gender,
    });

    res.status(201).json({
      message: "Admin registered successfully!",
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
*/

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        _id: admin._id,
        name: admin.name,
        nickName: admin.nickName,
        email: admin.email,
        phone: admin.phone || "",
        avatar: admin.avatar || null,
        dob: admin.dob,
        country: admin.country,
        gender: admin.gender,
        featured: admin.featured || false,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET CURRENT LOGGED IN ADMIN PROFILE
const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    return res.status(200).json({ success: true, admin });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---- Add this inside authController.js ----

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // req.admin comes from verifyAdmin middleware (has admin id)
    const admin = await Admin.findById(req.admin.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin apna profile khud update kare — naam, contact info, image
const updateProfile = async (req, res) => {
  try {
    const adminId = req.admin.id; // verifyAdmin middleware se aata hai

    const updateData = {};
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.nickName !== undefined) updateData.nickName = req.body.nickName;
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.country !== undefined) updateData.country = req.body.country;
    if (req.body.gender !== undefined) updateData.gender = req.body.gender;
    if (req.body.phone !== undefined) updateData.phone = req.body.phone;
    if (req.body.dob !== undefined && req.body.dob) updateData.dob = req.body.dob;
    if (req.body.featured !== undefined) {
      updateData.featured = req.body.featured === "true" || req.body.featured === true;
    }

    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    } else if (req.files?.avatar && req.files.avatar.length > 0) {
      updateData.avatar = `/uploads/${req.files.avatar[0].filename}`;
    } else if (req.files?.image && req.files.image.length > 0) {
      updateData.avatar = `/uploads/${req.files.image[0].filename}`;
    } else if (Array.isArray(req.files) && req.files.length > 0) {
      updateData.avatar = `/uploads/${req.files[0].filename}`;
    }

    const admin = await Admin.findByIdAndUpdate(adminId, updateData, {
      returnDocument: 'after',
    }).select("-password");

    res.json({ success: true, message: "Profile updated successfully", admin });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { /* registerAdmin, */ loginAdmin, getAdminProfile, changePassword, updateProfile };