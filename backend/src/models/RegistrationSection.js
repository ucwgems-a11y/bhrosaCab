const mongoose = require("mongoose");

const registrationSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      default: "Register Now",
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RegistrationSection", registrationSectionSchema);