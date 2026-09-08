const mongoose = require("mongoose");

const subAdminWithdrawalSchema = new mongoose.Schema(
  {
    subAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubAdmin",
      default: null,
    },
    subAdminName: {
      type: String,
      required: true,
      trim: true,
    },
    subAdminEmail: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "N/A",
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
    },
    branchName: {
      type: String,
      default: "N/A",
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed", "Rejected"],
      default: "Pending",
    },
    rejectReason: {
      type: String,
      default: "",
    },
    requestedDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubAdminWithdrawal", subAdminWithdrawalSchema);

