const mongoose = require("mongoose");

const autoPriceSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      index: true,
    },
    state: {
      type: String,
      default: null,
      trim: true,
    },
    city: {
      type: String,
      default: null,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AutoPrice", autoPriceSchema);
