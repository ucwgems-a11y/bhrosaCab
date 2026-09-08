const mongoose = require("mongoose");

const whyChooseLeftSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "THE BHROSA CAB ADVANTAGE",
    },
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    buttonText: {
      type: String,
      default: "📲 Download App",
    },
    buttonLink: {
      type: String,
      default: "#",
    },
    showBackgroundMap: {
      type: Boolean,
      default: true,
    },
    backgroundImage: {
      type: String, // optional — replaces the default world-map graphic
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WhyChooseLeft", whyChooseLeftSchema);