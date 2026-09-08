const mongoose = require("mongoose");

const emergencyNumberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    status: { type: String, default: "1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmergencyNumber", emergencyNumberSchema);
