const mongoose = require("mongoose");

const registrationEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    mysqlUserId: {
      type: Number,
      index: true,
    },
    eventName: {
      type: String,
      default: "registration_complete",
    },
    mediaSource: {
      type: String,
      default: null,
    },
    campaign: {
      type: String,
      default: null,
    },
    campaignId: {
      type: String,
      default: null,
    },
    adset: {
      type: String,
      default: null,
    },
    adsetId: {
      type: String,
      default: null,
    },
    ad: {
      type: String,
      default: null,
    },
    adId: {
      type: String,
      default: null,
    },
    channel: {
      type: String,
      default: null,
    },
    afStatus: {
      type: String,
      default: null,
    },
    installTime: {
      type: Date,
      default: null,
    },
    platform: {
      type: String,
      default: null,
    },
    appVersion: {
      type: String,
      default: null,
    },
    eventTime: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RegistrationEvent", registrationEventSchema);
