const mongoose = require("mongoose");

const aboutCompanySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "About Our Company",
    },
    heading: {
      type: String,
      required: true,
    },
    paragraph1: {
      type: String,
    },
    paragraph2: {
      type: String,
    },
    backImage: {
      type: String, // about3 — behind image
    },
    frontImage: {
      type: String, // about1 — front image with play button
    },
    videoLink: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutCompany", aboutCompanySchema);