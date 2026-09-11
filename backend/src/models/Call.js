const mongoose = require("mongoose");

const callSchema = new mongoose.Schema(
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
    number: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "calls",
    strict: false,
  }
);

module.exports = mongoose.model("Call", callSchema);
