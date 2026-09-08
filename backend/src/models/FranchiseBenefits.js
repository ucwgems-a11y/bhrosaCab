const mongoose = require("mongoose");

// Har benefit ek text line hai — numbering (1, 2, 3...) automatically
// index se generate hogi, isliye number khud type karne ki zaroorat nahi
const benefitItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { _id: false }
);

const franchiseBenefitsSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    subheading: {
      type: String,
    },
    image: {
      type: String,
    },
    benefits: {
      type: [benefitItemSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FranchiseBenefits", franchiseBenefitsSchema);