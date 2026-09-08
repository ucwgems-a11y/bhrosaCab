const mongoose = require("mongoose");

const heroSlideSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["banner", "content"],
      required: true,
    },
    order: {
      type: Number,
      default: 0, // slides ka sequence — 0 sabse pehle dikhega
    },
    // banner type ke liye
    image: {
      type: String, // uploaded file ka URL/path
    },
    // content type ke liye
    bg: {
      type: String,
    },
    car: {
      type: String,
    },
    subtitle: {
      type: String,
    },
    title: {
      type: String,
    },
    highlight: {
      type: String,
    },
    description: {
      type: String,
    },
    button: {
      type: String,
      default: "Book Now",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HeroSlide", heroSlideSchema);