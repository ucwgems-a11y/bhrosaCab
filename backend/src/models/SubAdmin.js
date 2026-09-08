const mongoose = require("mongoose");

const subAdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    country: {
      type: String,
      default: "India",
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    minimumMG: {
      type: Number,
      default: 0,
    },
    commission: {
      type: Number,
      default: 0,
      min: 0,
      max: 25,
    },
    agreement: {
      type: String, // uploaded PDF path
    },
    profileImage: {
      type: String, // uploaded image path
    },
    ipAddress: {
      type: String, // e.g. "49.43.110.253" or comma-separated list of allowed IPs
      default: "",
    },
    ipStatus: {
      type: Boolean,
      default: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "subadmin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubAdmin", subAdminSchema);
