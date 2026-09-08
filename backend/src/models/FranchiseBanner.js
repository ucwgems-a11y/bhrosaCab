const mongoose = require("mongoose");

const franchiseBannerSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Benefits Bhrosa Cab",
    },
    heading: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FranchiseBanner", franchiseBannerSchema);