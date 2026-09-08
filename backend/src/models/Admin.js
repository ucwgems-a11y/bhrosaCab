const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nickName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    dob: {
      type: Date,
    },
    country: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    role: {
      type: String,
      default: "admin",
    },
    phone: {
  type: String,
},
avatar: {
  type: String, // profile image ka uploaded path
},
featured: {
  type: Boolean,
  default: false, // "Check me out" checkbox
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);