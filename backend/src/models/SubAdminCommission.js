const mongoose = require("mongoose");

const subAdminCommissionSchema = new mongoose.Schema(
  {
    driverWalletRechargeId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      ref: "DriverWalletRecharge",
    },
    driverId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      ref: "Driver",
    },
    subAdminId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      ref: "SubAdmin",
    },
    amount: {
      type: Number,
      default: 0,
    },
    commissionPercent: {
      type: Number,
      default: 0,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "sub_admin_commissions",
    strict: false,
  }
);

module.exports = mongoose.model("SubAdminCommission", subAdminCommissionSchema);

