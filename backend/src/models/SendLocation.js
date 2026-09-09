const mongoose = require("mongoose");

const sendLocationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "User",
      index: true,
    },
    from_address: {
      type: String,
      default: "",
    },
    from_latitude: {
      type: String,
      default: null,
    },
    from_longitude: {
      type: String,
      default: null,
    },
    destination_address: {
      type: String,
      default: "",
    },
    destination_latitude: {
      type: String,
      default: null,
    },
    destination_longitude: {
      type: String,
      default: null,
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

module.exports = mongoose.model("SendLocation", sendLocationSchema, "send_locations");
