const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    bank_name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    image_url: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "banks",
    strict: false,
  }
);

module.exports = mongoose.model("Bank", bankSchema);

