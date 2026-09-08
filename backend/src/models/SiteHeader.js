const mongoose = require("mongoose");

const siteHeaderSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SiteHeader", siteHeaderSchema);