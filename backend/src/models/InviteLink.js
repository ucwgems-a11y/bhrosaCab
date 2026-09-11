const mongoose = require("mongoose");

const inviteLinkSchema = new mongoose.Schema(
  {
    link: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "1",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "invite_links",
  }
);

inviteLinkSchema.virtual("id").get(function () {
  return this._id ? this._id.toString() : null;
});

module.exports = mongoose.model("InviteLink", inviteLinkSchema);

