const mongoose = require("mongoose");

const serviceCardSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      default: 0,
    },
    bg: {
      type: String, // background shape image
    },
    icon: {
      type: String, // vehicle/icon image
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

module.exports = mongoose.model("ServiceCard", serviceCardSchema);