const mongoose = require("mongoose");

const userAppSchema = new mongoose.Schema(
  {
    status: {
      type: Number,
      default: 1, // 1 = active, 0 = inactive
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserApp", userAppSchema, "user_apps");

