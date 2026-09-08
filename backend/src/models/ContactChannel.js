const mongoose = require("mongoose");

const contactChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    logo: { type: String, default: "📞" },
    image: { type: String, default: null },
    status: { type: String, default: "1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactChannel", contactChannelSchema);
