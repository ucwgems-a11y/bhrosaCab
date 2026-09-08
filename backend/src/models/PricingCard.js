const mongoose = require("mongoose");

const pricingCardSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true, // stored as text so ranges like "₹20 - ₹27" work
    },
    features: {
      type: [String], // list of bullet points, e.g. "Spacious interior"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingCard", pricingCardSchema);