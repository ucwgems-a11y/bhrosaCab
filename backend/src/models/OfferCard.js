const mongoose = require("mongoose");

const offerCardSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      default: 0, // controls display sequence — 0 shows first
    },
    bg: {
      type: String, // background shape image
    },
    vehicle: {
      type: String, // scooter/bike/auto/car image
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfferCard", offerCardSchema);