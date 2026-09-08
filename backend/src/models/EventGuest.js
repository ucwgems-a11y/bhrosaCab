const mongoose = require("mongoose");

const eventGuestSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EventGuest", eventGuestSchema);