const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      sparse: true,
      index: true,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    rememberToken: {
      type: String,
      default: null,
    },
    aadhaarNumber: {
      type: String,
      default: null,
      trim: true,
    },
    aadhaarStatus: {
      type: String,
      enum: ["verified", "pending", "rejected", "none", null],
      default: null,
    },
    aadhaarFront: {
      type: String,
      default: null,
    },
    aadhaarBack: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    otp: {
      type: String,
      default: null,
    },
    appToken: {
      type: String,
      default: null,
    },
    fcmToken: {
      type: String,
      default: null,
    },
    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
    dob: {
      type: String,
      default: null,
    },
    nickName: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      default: "India",
    },
    state: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", null],
      default: null,
    },
    role: {
      type: Number,
      default: 0,
    },
    guardianStatus: {
      type: String,
      default: "0",
    },
    welcomeCoupon: {
      type: String,
      default: null,
      trim: true,
      index: true,
      sparse: true,
    },
    couponAmount: {
      type: Number,
      default: 200,
    },
    coupon_status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
