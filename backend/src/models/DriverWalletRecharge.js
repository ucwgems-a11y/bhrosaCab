const mongoose = require("mongoose");

const driverWalletRechargeSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "Driver",
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "1", // 1 for success
    },
    transaction_id: {
      type: String,
      default: null,
    },
    booking_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      ref: "Ride",
    },
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      ref: "User",
      index: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    strict: false,
  }
);

module.exports = mongoose.model(
  "DriverWalletRecharge",
  driverWalletRechargeSchema,
  "driver_wallet_recharge"
);
