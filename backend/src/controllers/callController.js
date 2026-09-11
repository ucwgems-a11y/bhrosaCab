const mongoose = require("mongoose");
const Call = require("../models/Call");
const Driver = require("../models/Driver");
const User = require("../models/User");

// Helper to format image URLs
const formatImageUrl = (imagePath, req) => {
  if (!imagePath) return null;
  if (
    typeof imagePath === "string" &&
    (imagePath.startsWith("http://") || imagePath.startsWith("https://"))
  ) {
    return imagePath;
  }
  const baseUrl =
    process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
  const cleanPath = String(imagePath).replace(/^\/+/, "");
  return `${baseUrl}/${cleanPath}`;
};

// 1. Driver Start Call (PHP: ApiController::fortyone -> 'driver-start-call')
exports.driverStartCall = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const otherUserId = req.body?.other_user_id;
    if (!otherUserId) {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: {
          other_user_id: ["The other user id field is required."],
        },
      });
    }

    const user = await User.findOne({
      $or: [
        ...(mongoose.isValidObjectId(otherUserId) ? [{ _id: otherUserId }] : []),
        { id: otherUserId },
        ...(!isNaN(Number(otherUserId)) ? [{ mysqlId: Number(otherUserId) }] : []),
      ],
    });

    const driverId = driver.id || driver.mysqlId || driver._id.toString();
    const uniqueMessageId = `${driverId}.${otherUserId}`;
    const userNumber = user?.number || user?.mobile || "";

    const now = new Date();
    const messageData = {
      unique_id: uniqueMessageId,
      driver_id: driver._id,
      other_user_id: otherUserId,
      number: userNumber,
      created_at: now,
      updated_at: now,
    };

    const savedCall = await Call.create(messageData);

    const formattedMessageData = {
      unique_id: uniqueMessageId,
      driver_id: driver._id.toString(),
      other_user_id: otherUserId,
      number: userNumber,
      created_at: now.toISOString().replace("T", " ").substring(0, 19),
      updated_at: now.toISOString().replace("T", " ").substring(0, 19),
      _id: savedCall._id,
    };

    return res.status(200).json({
      message: "Driver Call start successfully",
      unique_id: formattedMessageData,
    });
  } catch (ex) {
    console.error("driverStartCall Error:", ex);
    return res.status(500).json({
      message: "Error occurred",
      details: ex.message,
    });
  }
};

// 2. User Start Call (PHP: ApiController::fortytwo -> 'user-start-call')
exports.userStartCall = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const otherUserId = req.body?.other_user_id;
    if (!otherUserId) {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: {
          other_user_id: ["The other user id field is required."],
        },
      });
    }

    const userId = user.id || user.mysqlId || user._id.toString();
    const uniqueMessageId = `${userId}.${otherUserId}`;

    const now = new Date();
    const messageData = {
      unique_id: uniqueMessageId,
      other_user_id: user._id,
      driver_id: otherUserId,
      created_at: now,
      updated_at: now,
    };

    const savedCall = await Call.create(messageData);

    const formattedMessageData = {
      unique_id: uniqueMessageId,
      other_user_id: user._id.toString(),
      driver_id: otherUserId,
      created_at: now.toISOString().replace("T", " ").substring(0, 19),
      updated_at: now.toISOString().replace("T", " ").substring(0, 19),
      _id: savedCall._id,
    };

    return res.status(200).json({
      message: "User Call start successfully",
      unique_id: formattedMessageData,
    });
  } catch (ex) {
    console.error("userStartCall Error:", ex);
    return res.status(500).json({
      message: "Error occurred",
      details: ex.message,
    });
  }
};

// 3. User Get Call List (PHP: ApiController::fortythree -> 'user-get-call-list')
exports.userGetCallList = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.header("token") ||
      req.header("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const userIdCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const calls = await Call.find({
      other_user_id: { $in: userIdCriteria },
    })
      .sort({ created_at: -1, _id: -1 })
      .lean();

    const formattedCalls = [];
    for (const item of calls) {
      const driver = await Driver.findOne({
        $or: [
          ...(mongoose.isValidObjectId(item.driver_id)
            ? [{ _id: item.driver_id }]
            : []),
          { id: item.driver_id },
          ...(!isNaN(Number(item.driver_id))
            ? [{ mysqlId: Number(item.driver_id) }]
            : []),
        ],
      }).lean();

      let driverImage = null;
      if (driver && driver.image) {
        driverImage = formatImageUrl(driver.image, req);
      }

      const rawCreatedAt = item.created_at || item.createdAt;
      let dateString = null;
      if (rawCreatedAt) {
        const d = new Date(rawCreatedAt);
        const pad = (n) => String(n).padStart(2, "0");
        dateString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      }

      formattedCalls.push({
        name: driver?.name || "",
        driver_id: driver?._id ? String(driver._id) : item.driver_id,
        driver_image: driverImage,
        number: driver?.number || driver?.mobile || "",
        created_at: dateString,
      });
    }

    return res.status(200).json({
      message: "Calls List Retrieved Successfully",
      details: formattedCalls,
    });
  } catch (ex) {
    console.error("userGetCallList Error:", ex);
    return res.status(500).json({
      message: "Error occurred",
      details: ex.message,
    });
  }
};
