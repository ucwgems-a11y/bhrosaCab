const mongoose = require("mongoose");

const carBookingSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "User",
      index: true,
    },
    car_type: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    amount: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    Currency: {
      type: String,
      default: "₹",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

carBookingSchema.virtual("id").get(function () {
  return this._id ? this._id.toString() : null;
});

module.exports = mongoose.model("CarBooking", carBookingSchema, "car_bookings");

