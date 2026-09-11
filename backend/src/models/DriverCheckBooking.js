const mongoose = require("mongoose");

const driverCheckBookingSchema = new mongoose.Schema(
  {
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "Driver",
      index: true,
    },
    booking_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "User",
      index: true,
    },
    address_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    pay_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    price: {
      type: mongoose.Schema.Types.Mixed,
      default: "0",
    },
    distance: {
      type: Number,
      default: 0,
    },
    accept_status: {
      type: String,
      default: "1",
    },
    otp: {
      type: String,
      default: null,
    },
    arrive_status: {
      type: String,
      default: "0",
    },
    reason_id: {
      type: String,
      default: null,
    },
    tip_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    from_address: {
      type: String,
      default: null,
    },
    from_latitude: {
      type: String,
      default: null,
    },
    from_longitude: {
      type: String,
      default: null,
    },
    destination_address: {
      type: String,
      default: null,
    },
    destination_latitude: {
      type: String,
      default: null,
    },
    destination_longitude: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    strict: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

driverCheckBookingSchema.virtual("id").get(function () {
  return this._id ? this._id.toString() : null;
});

module.exports = mongoose.model(
  "DriverCheckBooking",
  driverCheckBookingSchema,
  "driver_check_bookings"
);

