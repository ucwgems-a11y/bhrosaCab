const mongoose = require("mongoose");

const driverRatingSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    rating: {
      type: Number,
      required: true,
    },
    review: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "driver_ratings",
    strict: false,
  }
);

module.exports = mongoose.model("DriverRating", driverRatingSchema);
