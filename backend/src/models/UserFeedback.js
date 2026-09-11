const mongoose = require("mongoose");

const userFeedbackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "user_feedbacks",
    strict: false,
  }
);

module.exports = mongoose.model("UserFeedback", userFeedbackSchema);
