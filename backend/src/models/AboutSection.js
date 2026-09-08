const mongoose = require("mongoose");

const aboutSectionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "ABOUT OUR COMPANY",
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
    image1: {
      type: String, // top-right small image (about3)
    },
    image2: {
      type: String, // bottom-left small image (about1)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutSection", aboutSectionSchema);