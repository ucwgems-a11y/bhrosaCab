const mongoose = require("mongoose");

const kilometerPriceSchema = new mongoose.Schema(
  {
    mysqlId: {
      type: Number,
      unique: true,
      sparse: true,
      index: true,
    },
    car_type_id: {
      type: Number,
      sparse: true,
      index: true,
    },
    carType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CarType",
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KilometerPrice", kilometerPriceSchema, "kilometer_prices");

