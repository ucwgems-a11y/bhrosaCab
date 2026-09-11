const AppIcon = require("../models/AppIcon");
const Promo = require("../models/Promo");

const formatImageUrl = (imgPath, req) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) return imgPath;
  let cleanPath = imgPath.replace(/\\/g, "/");
  if (cleanPath.includes("uploads/")) {
    cleanPath = cleanPath.substring(cleanPath.indexOf("uploads/"));
  }
  const host = req ? req.get("host") : "localhost:5000";
  const protocol = req && req.protocol ? req.protocol : "http";
  return `${protocol}://${host}/${cleanPath}`;
};

exports.getIcons = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search && search.trim()) {
      filter = { name: { $regex: search.trim(), $options: "i" } };
    }

    const list = await AppIcon.find(filter).sort({ createdAt: -1 });
    const formatted = list.map((item, idx) => ({
      id: item._id,
      _id: item._id,
      srNo: idx + 1,
      name: item.name,
      icon: item.icon || "⭐",
      image: formatImageUrl(item.image, req),
      status: item.status,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      list: formatted,
      icons: formatted,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getIconById = async (req, res) => {
  try {
    const item = await AppIcon.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Icon not found" });
    return res.status(200).json({
      success: true,
      data: {
        ...item._doc,
        id: item._id,
        image: formatImageUrl(item.image, req),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createIcon = async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Icon name is required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = "uploads/icons/" + req.file.filename;
    } else if (req.files && req.files.length > 0) {
      imagePath = "uploads/icons/" + req.files[0].filename;
    }

    const item = await AppIcon.create({
      name: name.trim(),
      image: imagePath,
      icon: icon || "⭐",
    });

    return res.status(201).json({
      success: true,
      message: "Icon created successfully",
      data: item,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateIcon = async (req, res) => {
  try {
    const { name, icon } = req.body;
    const item = await AppIcon.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Icon not found" });

    if (name) item.name = name.trim();
    if (icon) item.icon = icon;

    if (req.file) {
      item.image = "uploads/icons/" + req.file.filename;
    } else if (req.files && req.files.length > 0) {
      item.image = "uploads/icons/" + req.files[0].filename;
    }

    await item.save();
    return res.status(200).json({
      success: true,
      message: "Icon updated successfully",
      data: item,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteIcon = async (req, res) => {
  try {
    await AppIcon.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Icon deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mobile endpoint - Get Icons with Promo EndDate (PHP sixtynine / get-icons)
// @route   GET/ALL /api/get-icons
exports.getIconsMobile = async (req, res) => {
  try {
    const list = await AppIcon.find().sort({ createdAt: -1 }).lean();
    if (!list || list.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found",
      });
    }

    const lastPromo = await Promo.findOne().sort({ id: -1, _id: -1 }).lean();
    const lastEndDate = lastPromo ? (lastPromo.endDate || lastPromo.end_date || null) : null;

    const icons = list.map((item) => ({
      name: item.name,
      image: formatImageUrl(item.image, req),
      created_at: item.createdAt || item.created_at,
      updated_at: item.updatedAt || item.updated_at,
    }));

    return res.status(200).json({
      success: true,
      message: "Icons retrieved successfully",
      endDate: lastEndDate,
      icons: icons,
    });
  } catch (ex) {
    console.error("getIconsMobile Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

