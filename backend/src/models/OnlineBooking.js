const mongoose = require("mongoose");

const onlineBookingSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "ONLINE BOOKING",
    },
    title: {
      type: String,
      required: true,
    },
    carImage: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OnlineBooking", onlineBookingSchema);