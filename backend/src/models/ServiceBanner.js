const mongoose = require("mongoose");

const serviceBannerSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "OUR SERVICES!",
    },
    heading: {
      type: String,
      required: true,
    },
    highlight: {
      type: String, // the line shown in the accent color, e.g. "Arrive Confidently!"
    },
    description: {
      type: String,
    },
    backgroundImage: {
      type: String, // optional — falls back to the default banner image if not set
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceBanner", serviceBannerSchema);