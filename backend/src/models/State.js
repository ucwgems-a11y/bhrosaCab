const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    country_id: {
      type: Number,
      default: 101, // 101 for India
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Standard Indian States and Union Territories list for Country ID 101
const INDIAN_STATES = [
  { id: 1, country_id: 101, name: "Andhra Pradesh" },
  { id: 2, country_id: 101, name: "Arunachal Pradesh" },
  { id: 3, country_id: 101, name: "Assam" },
  { id: 4, country_id: 101, name: "Bihar" },
  { id: 5, country_id: 101, name: "Chhattisgarh" },
  { id: 6, country_id: 101, name: "Goa" },
  { id: 7, country_id: 101, name: "Gujarat" },
  { id: 8, country_id: 101, name: "Haryana" },
  { id: 9, country_id: 101, name: "Himachal Pradesh" },
  { id: 10, country_id: 101, name: "Jharkhand" },
  { id: 11, country_id: 101, name: "Karnataka" },
  { id: 12, country_id: 101, name: "Kerala" },
  { id: 13, country_id: 101, name: "Madhya Pradesh" },
  { id: 14, country_id: 101, name: "Maharashtra" },
  { id: 15, country_id: 101, name: "Manipur" },
  { id: 16, country_id: 101, name: "Meghalaya" },
  { id: 17, country_id: 101, name: "Mizoram" },
  { id: 18, country_id: 101, name: "Nagaland" },
  { id: 19, country_id: 101, name: "Odisha" },
  { id: 20, country_id: 101, name: "Punjab" },
  { id: 21, country_id: 101, name: "Rajasthan" },
  { id: 22, country_id: 101, name: "Sikkim" },
  { id: 23, country_id: 101, name: "Tamil Nadu" },
  { id: 24, country_id: 101, name: "Telangana" },
  { id: 25, country_id: 101, name: "Tripura" },
  { id: 26, country_id: 101, name: "Uttar Pradesh" },
  { id: 27, country_id: 101, name: "Uttarakhand" },
  { id: 28, country_id: 101, name: "West Bengal" },
  { id: 29, country_id: 101, name: "Andaman and Nicobar Islands" },
  { id: 30, country_id: 101, name: "Chandigarh" },
  { id: 31, country_id: 101, name: "Dadra and Nagar Haveli and Daman and Diu" },
  { id: 32, country_id: 101, name: "Delhi" },
  { id: 33, country_id: 101, name: "Jammu and Kashmir" },
  { id: 34, country_id: 101, name: "Ladakh" },
  { id: 35, country_id: 101, name: "Lakshadweep" },
  { id: 36, country_id: 101, name: "Puducherry" },
];

stateSchema.statics.getIndianStatesList = async function () {
  const count = await this.countDocuments({ country_id: 101 });
  if (count === 0) {
    try {
      await this.insertMany(INDIAN_STATES, { ordered: false });
    } catch (e) {
      // Ignore unique duplicate errors during concurrent calls
    }
  }
  return this.find({ country_id: 101 }).select("id name -_id").sort({ id: 1 }).lean();
};

module.exports = mongoose.model("State", stateSchema, "states");

