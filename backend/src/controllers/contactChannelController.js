const ContactChannel = require("../models/ContactChannel");

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

exports.getContactChannels = async (req, res) => {
  try {
    const list = await ContactChannel.find().sort({ createdAt: 1 });
    const formatted = list.map((item, idx) => ({
      id: item._id,
      _id: item._id,
      srNo: idx + 1,
      name: item.name,
      address: item.address,
      logo: item.logo || "📞",
      image: item.image ? formatImageUrl(item.image, req) : null,
      status: item.status,
    }));
    return res.status(200).json({ success: true, count: formatted.length, data: formatted, list: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContactChannelById = async (req, res) => {
  try {
    const item = await ContactChannel.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Contact channel not found" });
    return res.status(200).json({
      success: true,
      data: {
        ...item._doc,
        id: item._id,
        image: item.image ? formatImageUrl(item.image, req) : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createContactChannel = async (req, res) => {
  try {
    const { name, address, logo } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, message: "Name and address/value are required" });
    }
    let imagePath = null;
    if (req.file) {
      imagePath = "uploads/carandfare/" + req.file.filename;
    } else if (req.files && req.files.length > 0) {
      imagePath = "uploads/carandfare/" + req.files[0].filename;
    }

    const item = await ContactChannel.create({
      name: name.trim(),
      address: address.trim(),
      logo: logo || "📞",
      image: imagePath,
    });
    return res.status(201).json({ success: true, message: "Contact channel created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateContactChannel = async (req, res) => {
  try {
    const { name, address, logo } = req.body;
    const item = await ContactChannel.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Contact channel not found" });
    if (name) item.name = name.trim();
    if (address) item.address = address.trim();
    if (logo) item.logo = logo;
    if (req.file) {
      item.image = "uploads/carandfare/" + req.file.filename;
    } else if (req.files && req.files.length > 0) {
      item.image = "uploads/carandfare/" + req.files[0].filename;
    }
    await item.save();
    return res.status(200).json({ success: true, message: "Contact channel updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteContactChannel = async (req, res) => {
  try {
    await ContactChannel.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Contact channel deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
