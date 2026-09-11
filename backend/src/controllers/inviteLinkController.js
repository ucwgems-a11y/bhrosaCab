const InviteLink = require("../models/InviteLink");

// @desc    Save App Invite Link (PHP sixtyOne / save-app-invite-link)
// @route   POST /api/save-app-invite-link
exports.saveAppInviteLink = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const link = req.body?.link;
    if (!link || typeof link !== "string" || !link.trim()) {
      return res.status(422).json({
        message: "The link field is required.",
      });
    }

    const existingLink = await InviteLink.findOne();
    if (existingLink) {
      return res.status(409).json({
        success: false,
        message: "An entry already exists in the database",
      });
    }

    await InviteLink.create({
      link: link.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "App Link added successfully",
    });
  } catch (ex) {
    console.error("saveAppInviteLink Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// @desc    Get App Invite Link (PHP sixtytwo / get-app-invite-link)
// @route   GET/ALL /api/get-app-invite-link
exports.getAppInviteLink = async (req, res) => {
  try {
    const firstLink = await InviteLink.findOne().sort({ created_at: 1, _id: 1 }).lean();
    if (!firstLink) {
      return res.status(404).json({
        success: false,
        message: "No data found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: firstLink._id ? String(firstLink._id) : firstLink.id,
        _id: firstLink._id,
        link: firstLink.link,
        created_at: firstLink.created_at || firstLink.createdAt,
        updated_at: firstLink.updated_at || firstLink.updatedAt,
      },
    });
  } catch (ex) {
    console.error("getAppInviteLink Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

