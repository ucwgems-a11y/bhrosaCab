const mongoose = require("mongoose");

const userRideCancelSchema = new mongoose.Schema(
  {
    user_booking_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "Ride",
      index: true,
    },
    fine: {
      type: Number,
      default: 90,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model(
  "UserRideCancel",
  userRideCancelSchema,
  "user_ride_cancels"
);
