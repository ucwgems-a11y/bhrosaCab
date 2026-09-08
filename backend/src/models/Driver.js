const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    wallet: {
      type: Number,
      default: 0.0,
    },
    name: {
      type: String,
      trim: true,
      default: null,
    },
    last_name: {
      type: String,
      trim: true,
      default: null,
    },
    email: {
      type: String,
      trim: true,
      default: null,
    },
    number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      default: null,
    },
    otp: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    reg_id: {
      type: String,
      default: null,
    },
    country_code: {
      type: String,
      default: null,
    },
    active_status: {
      type: Number,
      default: 0,
    },
    register: {
      type: Number,
      default: 0,
    },
    block_status: {
      type: Number,
      default: 0, // 0 for not block; 1 for block
    },
    image: {
      type: String,
      default: null,
    },
    dob: {
      type: String,
      default: null,
    },
    state: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      default: null,
    },
    license_number: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    vehicle_number: {
      type: String,
      default: null,
    },
    driving_licence: {
      type: String,
      default: null,
    },
    vehicle_rc: {
      type: String,
      default: null,
    },
    status: {
      type: Number,
      default: 0, // 1 for pending; 2 for approve; 3 for reject
    },
    latitude: {
      type: String,
      default: null,
    },
    longitude: {
      type: String,
      default: null,
    },
    cateogory: {
      type: String,
      default: null,
    },
    brand: {
      type: String,
      default: null,
    },
    model: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    manufacturing_year: {
      type: String,
      default: null,
    },
    vehicle_front_image: {
      type: String,
      default: null,
    },
    vehicle_back_image: {
      type: String,
      default: null,
    },
    government_id_proof: {
      type: String,
      default: null,
    },
    driving_licence_front: {
      type: String,
      default: null,
    },
    driving_licence_back: {
      type: String,
      default: null,
    },
    driving_licence_status: {
      type: String,
      default: "approved", // e.g. "approved", "pending", "rejected"
    },
    aadhaar_number: {
      type: String,
      default: null,
    },
    aadhaar_number_status: {
      type: String,
      default: "approved", // e.g. "approved", "pending", "rejected"
    },
    insurence_front: {
      type: String,
      default: null,
    },
    insurence_back: {
      type: String,
      default: null,
    },
    id_proof_front: {
      type: String,
      default: null,
    },
    id_proof_back: {
      type: String,
      default: null,
    },
    vehicle_rc_front: {
      type: String,
      default: null,
    },
    vehicle_rc_back: {
      type: String,
      default: null,
    },
    vehicle_interior_image: {
      type: String,
      default: null,
    },
    screen_title: {
      type: String,
      default:
        "Thank you for choosing BhrosaCab. Your application is currently under review, and we will notify you once there is an update.",
    },
    screen_description: {
      type: String,
      default:
        "If you have any queries regarding your application, please feel free to contact us. Our customer support team will be glad to assist you.",
    },
    customer_care_number: {
      type: String,
      default: "9115513232",
    },
    document_verify_status: {
      type: String,
      default: "0", // e.g. "accepted", "pending", "rejected"
    },
    referalCode: {
      type: String,
      default: null,
    },
    referByCode: {
      type: String,
      default: null,
    },
    driverType: {
      type: String,
      default: "Driver",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual aliases for clean API consumption while preserving exact DB field names
driverSchema.virtual("id").get(function () {
  return this.driver_id || this._id;
});

module.exports = mongoose.model("Driver", driverSchema, "register_drivers");
