const mongoose = require("mongoose");

// Ye ek hi jagah hai jahan se phone, email, address poori website me use hote hain —
// Header, Footer, aur Contact page teeno isi model ko fetch karte hain.
const companyInfoSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompanyInfo", companyInfoSchema);