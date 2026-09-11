const mongoose = require("mongoose");

const driverWithdrawRequestSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "Driver",
      index: true,
    },
    account_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "DriverAccount",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "0", // 0 = Pending, 1 = Approved, 2 = Rejected
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "driver_withdrow_requests",
    strict: false,
  }
);

module.exports = mongoose.model(
  "DriverWithdrawRequest",
  driverWithdrawRequestSchema
);

