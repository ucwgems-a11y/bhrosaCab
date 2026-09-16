const mongoose = require("mongoose");

const mediaCoverageSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    displayDate: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    newspaper: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },
    linkText: {
      type: String,
      trim: true,
      default: "ई-पेपर / खबर पढ़ें",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MediaCoverage", mediaCoverageSchema);

