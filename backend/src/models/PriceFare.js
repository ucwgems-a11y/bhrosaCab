const mongoose = require("mongoose");

const priceFareSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      index: true,
    },
    vehicleType: {
      type: Number,
      required: true,
      index: true,
    },
    carType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarType",
    },
    farePerKm: {
      type: String,
      default: "0.00",
    },
    farePerKmTo: {
      type: String,
      default: null,
    },
    outStationAboveKm: {
      type: Number,
      default: null,
    },
    outStationAbovePrice: {
      type: Number,
      default: 0.00,
    },
    image: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceFare", priceFareSchema);
