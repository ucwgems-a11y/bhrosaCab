const mongoose = require("mongoose");

const appIconSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: "⭐",
    },
    status: {
      type: String,
      default: "1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppIcon", appIconSchema);
