const mongoose = require("mongoose");

const taxiCtaItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { _id: false }
);

const taxiCtaSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Bhrosa Cab Taxi Services!",
    },
    heading: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: "Book a Taxi",
    },
    buttonLink: {
      type: String,
      default: "/",
    },
    items: {
      type: [taxiCtaItemSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TaxiCta", taxiCtaSchema);