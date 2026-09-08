const mongoose = require("mongoose");

const privacyPolicyClauseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    status: { type: String, default: "1" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PrivacyPolicyClause", privacyPolicyClauseSchema);
