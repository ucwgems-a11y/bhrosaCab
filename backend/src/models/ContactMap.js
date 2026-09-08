const mongoose = require("mongoose");

const contactMapSchema = new mongoose.Schema(
  {
    mapEmbedUrl: {
      type: String,
      required: true,
      default: "https://www.google.com/maps?q=Mumbai,Maharashtra&output=embed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactMap", contactMapSchema);