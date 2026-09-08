const mongoose = require("mongoose");

const aboutBannerSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "About Company!",
    },
    heading: {
      type: String,
      required: true,
    },
    highlight: {
      type: String, // the part of the heading shown in blue, e.g. "Bhrosa Cab!"
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutBanner", aboutBannerSchema);