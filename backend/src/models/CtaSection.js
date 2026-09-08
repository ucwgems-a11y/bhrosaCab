const mongoose = require("mongoose");

// Har list item sirf ek text line hai (icon fixed rahega, arrow wala)
const ctaItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { _id: false }
);

const ctaSectionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Bhrosa Cab Services!",
    },
    heading: {
      type: String,
      required: true,
    },
    buttonText: {
      type: String,
      default: "Book a Cab",
    },
    buttonLink: {
      type: String,
      default: "#",
    },
    image: {
      type: String,
    },
    items: {
      type: [ctaItemSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CtaSection", ctaSectionSchema);