const mongoose = require("mongoose");

const appBannerSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, default: "1" }, // "1": Home Screen, "2": Ride Top Screen, "3": Ride Footer Screen
    image: { type: String, required: true },
    link: { type: String, default: "" },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    status: { type: String, default: "1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppBanner", appBannerSchema);
