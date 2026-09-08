const mongoose = require("mongoose");

const cancelReasonSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: "user",
      enum: ["user", "driver", "all"],
    },
    status: {
      type: String,
      default: "1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CancelReason", cancelReasonSchema);
