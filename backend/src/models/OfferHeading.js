const mongoose = require("mongoose");

const offerHeadingSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "WHAT WE OFFER",
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

module.exports = mongoose.model("OfferHeading", offerHeadingSchema);