const mongoose = require("mongoose");

const userWalletRechargeSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "User",
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "1",
    },
    transaction_id: {
      type: String,
      default: null,
      index: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      ref: "Ride",
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
  }
);

module.exports = mongoose.model(
  "UserWalletRecharge",
  userWalletRechargeSchema,
  "user_wallet_recharge"
);
