const mongoose = require("mongoose");

const footerVehicleSchema = new mongoose.Schema(
  {
    order: { type: Number, default: 0 },
    image: { type: String, required: true },
    // "rightToLeft" = taxi jaisa (right se left jaata hai)
    // "leftToRight" = truck jaisa (left se right jaata hai)
    direction: {
      type: String,
      enum: ["rightToLeft", "leftToRight"],
      default: "rightToLeft",
    },
    speed: {
      type: Number, // seconds — jitna kam utna tez
      default: 15,
    },
    width: {
      type: Number,
      default: 120,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FooterVehicle", footerVehicleSchema);