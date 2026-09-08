const mongoose = require("mongoose");

const footerTopSchema = new mongoose.Schema(
  {
    logo: { type: String },
    description: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FooterTop", footerTopSchema);