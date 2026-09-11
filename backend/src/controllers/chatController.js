const mongoose = require("mongoose");
const Message = require("../models/Message");
const Driver = require("../models/Driver");
const User = require("../models/User");
const fcmService = require("../services/fcmService");

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

// 1. Driver Send Message (PHP: ApiController::thirtysix -> 'driver-msg-send')
exports.driverSendMessage = async (req, res) => {
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
        message: "Invalid user token",
      });
    }

    const otherUserId = req.body?.other_user_id;
    const message = req.body?.message;

    if (!otherUserId || message === undefined || message === null) {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: {
          ...(!otherUserId ? { other_user_id: ["The other user id field is required."] } : {}),
          ...(message === undefined || message === null ? { message: ["The message field is required."] } : {}),
        },
      });
    }

    const driverId = driver.id || driver.mysqlId || driver._id.toString();
    const uniqueMessageId = `${driverId}.${otherUserId}`;

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const formattedTimestamp = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const formattedDateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${formattedTimestamp}`;

    const messageData = {
      unique_id: uniqueMessageId,
      driver_id: driver._id,
      other_user_id: otherUserId,
      message: String(message),
      status: "1",
      created_at: now,
      updated_at: now,
    };

    const savedMessage = await Message.create(messageData);

    const formattedResponseData = {
      unique_id: uniqueMessageId,
      driver_id: driver._id.toString(),
      other_user_id: otherUserId,
      message: String(message),
      status: "1",
      timestamp: formattedTimestamp,
      created_at: formattedDateTime,
      updated_at: formattedDateTime,
      _id: savedMessage._id,
    };

    return res.status(200).json({
      message: "Message sent successfully",
      unique_id: formattedResponseData,
    });
  } catch (ex) {
    console.error("driverSendMessage Error:", ex);
    return res.status(500).json({
      message: "Error occurred",
      details: ex.message,
    });
  }
};

// 2. User Send Message (PHP: ApiController::thirtyseven -> 'user-msg-send')
exports.userSendMessage = async (req, res) => {
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
    const message = req.body?.message;

    if (!otherUserId || message === undefined || message === null) {
      return res.status(422).json({
        message: "The given data was invalid.",
        errors: {
          ...(!otherUserId ? { other_user_id: ["The other user id field is required."] } : {}),
          ...(message === undefined || message === null ? { message: ["The message field is required."] } : {}),
        },
      });
    }

    // Find recipient driver
    const driver = await Driver.findOne({
      $or: [
        ...(mongoose.isValidObjectId(otherUserId) ? [{ _id: otherUserId }] : []),
        { id: otherUserId },
        ...(!isNaN(Number(otherUserId)) ? [{ mysqlId: Number(otherUserId) }] : []),
      ],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Driver not found",
      });
    }

    const userId = user.id || user.mysqlId || user._id.toString();
    const driverId = driver.id || driver.mysqlId || driver._id.toString();
    const uniqueMessageId = `${userId}.${driverId}`;

    const now = new Date();
    const messageData = {
      unique_id: uniqueMessageId,
      other_user_id: user._id,
      driver_id: driver._id,
      message: String(message),
      status: "1",
      created_at: now,
      updated_at: now,
    };

    await Message.create(messageData);

    // Send push notification to recipient driver if reg_id exists
    if (driver.reg_id && String(driver.reg_id).trim() !== "") {
      const title = driver.name || "Driver";
      const body = "Message: " + message;
      try {
        await fcmService.sendNotification(driver.reg_id, title, body);
      } catch (err) {
        console.error("FCM Notification error in userSendMessage:", err.message);
      }
    }

    return res.status(200).json({
      message: "Message sent successfully",
      unique_id: uniqueMessageId,
    });
  } catch (ex) {
    console.error("userSendMessage Error:", ex);
    return res.status(500).json({
      message: "Error occurred",
      details: ex.message,
    });
  }
};

// 3. Driver Get Message List (PHP: ApiController::thirtynine -> 'driver-get-msg-list')
exports.driverGetMessageList = async (req, res) => {
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

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const driverIdCriteria = [
      driver._id,
      driver._id.toString(),
      ...(driver.id ? [driver.id, String(driver.id)] : []),
      ...(driver.mysqlId ? [driver.mysqlId, Number(driver.mysqlId)] : []),
    ];

    // Fetch all messages involving this driver sorted desc
    const allMessages = await Message.find({
      driver_id: { $in: driverIdCriteria },
    })
      .sort({ created_at: -1, _id: -1 })
      .lean();

    // Group by other_user_id (latest message per user)
    const seenUsers = new Set();
    const latestMessages = [];

    for (const msg of allMessages) {
      const uKey = String(msg.other_user_id);
      if (!seenUsers.has(uKey)) {
        seenUsers.add(uKey);
        latestMessages.push(msg);
      }
    }

    // Join user info
    const data = [];
    for (const msg of latestMessages) {
      const otherUser = await User.findOne({
        $or: [
          ...(mongoose.isValidObjectId(msg.other_user_id)
            ? [{ _id: msg.other_user_id }]
            : []),
          { id: msg.other_user_id },
          ...(!isNaN(Number(msg.other_user_id))
            ? [{ mysqlId: Number(msg.other_user_id) }]
            : []),
        ],
      }).lean();

      let imageUrl = null;
      if (otherUser && otherUser.image) {
        imageUrl = formatImageUrl(otherUser.image, req);
      }

      const rawCreatedAt = msg.created_at || msg.createdAt;
      let formattedCreatedAt = rawCreatedAt;
      if (rawCreatedAt) {
        formattedCreatedAt = new Date(rawCreatedAt)
          .toISOString()
          .replace("T", " ")
          .substring(0, 19);
      }

      data.push({
        message_id: msg._id ? String(msg._id) : msg.id,
        message: msg.message || "",
        created_at: formattedCreatedAt,
        other_user_id: msg.other_user_id,
        user_id: otherUser?._id ? String(otherUser._id) : otherUser?.id || msg.other_user_id,
        user_name: otherUser?.name || "User",
        user_image: imageUrl,
      });
    }

    return res.status(200).json({
      message: "Messages retrieved successfully",
      data: data,
    });
  } catch (ex) {
    console.error("driverGetMessageList Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 4. User Get Message List (PHP: ApiController::forty -> 'user-get-msg-list')
exports.userGetMessageList = async (req, res) => {
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

    // Fetch all messages involving this user sorted desc
    const allMessages = await Message.find({
      other_user_id: { $in: userIdCriteria },
    })
      .sort({ created_at: -1, _id: -1 })
      .lean();

    // Group by driver_id (latest message per driver)
    const seenDrivers = new Set();
    const latestMessages = [];

    for (const msg of allMessages) {
      const dKey = String(msg.driver_id);
      if (!seenDrivers.has(dKey)) {
        seenDrivers.add(dKey);
        latestMessages.push(msg);
      }
    }

    // Join driver info
    const data = [];
    for (const msg of latestMessages) {
      const driver = await Driver.findOne({
        $or: [
          ...(mongoose.isValidObjectId(msg.driver_id)
            ? [{ _id: msg.driver_id }]
            : []),
          { id: msg.driver_id },
          ...(!isNaN(Number(msg.driver_id))
            ? [{ mysqlId: Number(msg.driver_id) }]
            : []),
        ],
      }).lean();

      let driverImage = null;
      if (driver && driver.image) {
        driverImage = formatImageUrl(driver.image, req);
      }

      const rawCreatedAt = msg.created_at || msg.createdAt;
      let dateString = rawCreatedAt;
      if (rawCreatedAt) {
        const d = new Date(rawCreatedAt);
        const pad = (n) => String(n).padStart(2, "0");
        dateString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      }

      data.push({
        driver_id: driver?._id ? String(driver._id) : msg.driver_id,
        message: msg.message || "",
        created_at: dateString,
        driver_image: driverImage,
        driver_name: driver?.name || "Driver",
      });
    }

    return res.status(200).json({
      message: "Messages list retrieved successfully",
      data: data,
    });
  } catch (ex) {
    console.error("userGetMessageList Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 5. User Get Messages Thread with a specific driver (PHP: ApiController::fortytfor -> 'user-get-msg')
exports.userGetMessages = async (req, res) => {
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

    const otherUserId = req.query.other_user_id || req.body?.other_user_id;

    const userCriteria = [
      user._id,
      user._id.toString(),
      ...(user.id ? [user.id, String(user.id)] : []),
      ...(user.mysqlId ? [user.mysqlId, Number(user.mysqlId)] : []),
    ];

    const driverCriteria = otherUserId
      ? [
          ...(mongoose.isValidObjectId(otherUserId) ? [otherUserId] : []),
          String(otherUserId),
          ...(!isNaN(Number(otherUserId)) ? [Number(otherUserId)] : []),
        ]
      : [];

    const query = {
      $or: [
        { other_user_id: user._id },
        { other_user_id: user._id.toString() },
        ...(user.id ? [{ other_user_id: user.id }] : []),
      ],
    };

    if (otherUserId) {
      query.$and = [
        {
          $or: [
            ...(mongoose.isValidObjectId(otherUserId)
              ? [
                  { driver_id: new mongoose.Types.ObjectId(otherUserId) },
                  { driver_id: otherUserId },
                ]
              : []),
            { driver_id: String(otherUserId) },
            ...(!isNaN(Number(otherUserId))
              ? [{ driver_id: Number(otherUserId) }]
              : []),
          ],
        },
      ];
    }

    const messages = await Message.find(query)
      .sort({ created_at: 1, _id: 1 })
      .lean();

    return res.status(200).json({
      message: "User messages retrieved successfully",
      data: messages,
    });
  } catch (ex) {
    console.error("userGetMessages Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

