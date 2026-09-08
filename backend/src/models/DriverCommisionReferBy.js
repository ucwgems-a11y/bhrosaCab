const mongoose = require("mongoose");

const driverCommisionReferBySchema = new mongoose.Schema(
  {
    driverWalletRechargeId: {
      type: mongoose.Schema.Types.Mixed,
      ref: "DriverWalletRecharge",
      default: null,
      index: true,
    },
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Driver",
      required: true,
      index: true,
    },
    referByCode: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    referrer_id: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Driver",
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    commisionInPercent: {
      type: Number,
      default: 5,
    },
    commisionAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["0", "1"],
      default: "0",
      index: true,
    },
    credited_at: {
      type: Date,
      default: null,
    },
    payoutMonth: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model(
  "DriverCommisionReferBy",
  driverCommisionReferBySchema,
  "driverCommisionReferBy"
);
