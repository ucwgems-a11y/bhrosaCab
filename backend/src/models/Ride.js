const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    // User reference / ID
    user_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
      ref: "User",
    },

    // Driver reference / ID
    driver_id: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
      index: true,
      ref: "Driver",
    },

    // Vehicle category reference / ID (matches car_types / price_fare)
    vehicle_id: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      ref: "CarType",
    },

    // Pickup Details
    from: {
      type: String,
      required: true,
      trim: true,
    },
    from_lat: {
      type: String,
      required: true,
      trim: true,
    },
    from_lng: {
      type: String,
      required: true,
      trim: true,
    },

    // Drop Details
    to: {
      type: String,
      required: true,
      trim: true,
    },
    to_lat: {
      type: String,
      required: true,
      trim: true,
    },
    to_lng: {
      type: String,
      required: true,
      trim: true,
    },

    // Fares
    rideFare: {
      type: Number,
      default: 0,
    },
    totalFare: {
      type: String,
      required: true,
      default: "0",
    },

    // Waiting Time & Charges
    waitingMinutes: {
      type: Number,
      default: 0,
    },
    waitingCharge: {
      type: Number,
      default: 0,
    },

    // Extra Charges
    extraChargeParcent: {
      type: Number,
      default: null,
    },
    extraChargeAmount: {
      type: Number,
      default: 0.0,
    },

    // Distance Surcharges
    aboveDistanceKm: {
      type: Number,
      default: null,
    },
    aboveDistanceParcent: {
      type: Number,
      default: null,
    },
    aboveDistancePrice: {
      type: Number,
      default: 0.0,
    },

    // Booking Mode
    booking_type: {
      type: String,
      enum: ["inCity", "outStation"],
      default: "inCity",
    },

    // Date & Time
    date: {
      type: String,
      default: null,
    },
    time: {
      type: String,
      default: null,
    },

    // Outstation Above Distance Rules
    outStationADkm: {
      type: Number,
      default: null,
    },
    outStationADparcent: {
      type: Number,
      default: null,
    },
    outStationADprice: {
      type: Number,
      default: 0.0,
    },

    // Total Trip Distance (KM string e.g. "8.63")
    distance: {
      type: String,
      required: true,
      default: "0.00",
    },

    // Ride Start OTP
    otp: {
      type: String,
      default: null,
    },

    // Platform Commission Status (0 = pending, 1 = deducted)
    commission_status: {
      type: Number,
      default: 0,
    },

    // Ride Status ("booked", "arrived", "ongoing", "completed", "cancelled")
    status: {
      type: String,
      default: "booked",
      index: true,
    },

    // Cancellation Reason (MySQL field name: 'reson')
    reson: {
      type: String,
      default: null,
    },

    // Legacy Timestamps
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field to access cancellation reason as 'reason'
rideSchema.virtual("reason").get(function () {
  return this.reson;
});
rideSchema.virtual("reason").set(function (val) {
  this.reson = val;
});

// Explicitly register model to 'user_bookings' collection
module.exports = mongoose.model("Ride", rideSchema, "user_bookings");
