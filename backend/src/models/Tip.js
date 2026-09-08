const mongoose = require("mongoose");

const tipSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tip", tipSchema);
