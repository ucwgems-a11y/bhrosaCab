const mongoose = require("mongoose");

const pricingHeadingSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "TRANSPARENT PRICING",
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

module.exports = mongoose.model("PricingHeading", pricingHeadingSchema);