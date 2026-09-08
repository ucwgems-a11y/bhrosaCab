const mongoose = require("mongoose");

const driverTopupSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      index: true,
    },
    carTypeId: {
      type: Number,
      required: true,
      index: true,
    },
    carType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarType",
    },
    topupAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    slabs: {
      type: String,
      default: null,
    },
    timeLimit: {
      type: String,
      default: null,
    },
    aboveDistance: {
      type: String,
      default: null,
    },
    extraCharge: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DriverTopup", driverTopupSchema);
 