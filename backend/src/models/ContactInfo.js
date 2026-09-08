const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      default: "Have Any Questions?",
    },
    highlight: {
      type: String, // the word shown in the accent color, e.g. "Questions?"
    },
    description: {
      type: String,
    },
    companyName: {
      type: String,
      default: "Bhrosa Group",
    },
    address: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    workingHours: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInfo", contactInfoSchema);