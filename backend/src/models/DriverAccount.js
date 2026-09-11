const mongoose = require("mongoose");

const driverAccountSchema = new mongoose.Schema(
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
    bank_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "Bank",
      index: true,
    },
    holder_name: {
      type: String,
      required: true,
      trim: true,
    },
    account_number: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    ifsc_code: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "driver_accounts",
    strict: false,
  }
);

module.exports = mongoose.model("DriverAccount", driverAccountSchema);

