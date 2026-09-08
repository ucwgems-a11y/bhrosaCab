const mongoose = require("mongoose");

const carTypeSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      index: true,
    },
    typeName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "1",
    },
    icon: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CarType", carTypeSchema);
