const mongoose = require("mongoose");

const featureItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    icon: { type: String }, // ab har feature ka apna icon hoga
  },
  { _id: false }
);

const downloadSectionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "ONLINE BOOKING",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    downloadLink: {
      type: String,
      default: "#",
    },
    mobileImage: {
      type: String,
    },
    markerImage: {
      type: String,
    },
    features: {
      type: [featureItemSchema],
      validate: [(val) => val.length <= 3, "Maximum 3 features allowed"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DownloadSection", downloadSectionSchema);