const mongoose = require("mongoose");

const userSaveLocationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "User",
      index: true,
    },
    name: {
      type: String,
      default: "",
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

module.exports = mongoose.model("UserSaveLocation", userSaveLocationSchema, "user_save_locations");
