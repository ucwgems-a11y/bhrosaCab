const mongoose = require("mongoose");

const footerLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const footerMiddleSchema = new mongoose.Schema(
  {
    address: { type: String },
    email: { type: String },
    links: { type: [footerLinkSchema] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FooterMiddle", footerMiddleSchema);