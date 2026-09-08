const AppBanner = require("../models/AppBanner");

const bannerTypeMap = {
  "1": "Home Screen",
  "2": "Ride Top Screen",
  "3": "Ride Footer Screen",
};

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

const formatDateDisplay = (dateObj) => {
  if (!dateObj) return "Just now";
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return "Just now";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

exports.getAppBanners = async (req, res) => {
  try {
    const list = await AppBanner.find().sort({ createdAt: -1 });
    const formatted = list.map((item, idx) => ({
      id: item._id,
      _id: item._id,
      srNo: idx + 1,
      typeValue: item.type,
      type: bannerTypeMap[item.type] || item.type || "Home Screen",
      image: formatImageUrl(item.image, req),
      link: item.link || "-",
      rawLink: item.link || "",
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status,
      createdAt: formatDateDisplay(item.createdAt),
      updatedAt: formatDateDisplay(item.updatedAt),
    }));
    return res.status(200).json({ success: true, count: formatted.length, data: formatted, list: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAppBannerById = async (req, res) => {
  try {
    const item = await AppBanner.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "App Banner not found" });
    return res.status(200).json({
      success: true,
      data: {
        ...item._doc,
        id: item._id,
        typeValue: item.type,
        typeLabel: bannerTypeMap[item.type] || item.type,
        image: formatImageUrl(item.image, req),
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAppBanner = async (req, res) => {
  try {
    const { type, link, startDate, endDate } = req.body;
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Type, Start Date, and End Date are required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = "uploads/banners/" + req.file.filename;
    } else if (req.files && req.files.length > 0) {
      imagePath = "uploads/banners/" + req.files[0].filename;
    }

    if (!imagePath) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }

    const item = await AppBanner.create({
      type: type || "1",
      image: imagePath,
      link: link ? link.trim() : "",
      startDate,
      endDate,
    });

    return res.status(201).json({ success: true, message: "App Banner created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAppBanner = async (req, res) => {
  try {
    const { type, link, startDate, endDate } = req.body;
    const item = await AppBanner.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "App Banner not found" });

    if (type) item.type = type;
    if (link !== undefined) item.link = link.trim();
    if (startDate) item.startDate = startDate;
    if (endDate) item.endDate = endDate;

    if (req.file) {
      item.image = "uploads/banners/" + req.file.filename;
    } else if (req.files && req.files.length > 0) {
      item.image = "uploads/banners/" + req.files[0].filename;
    }

    await item.save();
    return res.status(200).json({ success: true, message: "App Banner updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAppBanner = async (req, res) => {
  try {
    await AppBanner.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "App Banner deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
