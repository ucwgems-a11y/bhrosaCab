const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    unique_id: {
      type: String,
      default: null,
      index: true,
    },
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    other_user_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "messages",
    strict: false,
  }
);

module.exports = mongoose.model("Message", messageSchema);
