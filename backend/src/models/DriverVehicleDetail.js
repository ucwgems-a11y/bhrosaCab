const mongoose = require("mongoose");

const driverVehicleDetailSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "Driver",
      index: true,
    },
    vehicle_number: {
      type: String,
      required: true,
      trim: true,
    },
    vehicle_type: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    vehicle_name: {
      type: String,
      default: null,
      trim: true,
    },
    vehicle_model: {
      type: String,
      default: null,
      trim: true,
    },
    vehicle_rc: {
      type: String,
      default: null,
    },
    vehicle_image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

driverVehicleDetailSchema.virtual("id").get(function () {
  return this._id ? this._id.toString() : null;
});

module.exports = mongoose.model(
  "DriverVehicleDetail",
  driverVehicleDetailSchema,
  "driver_vehicle_details"
);

