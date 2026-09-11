const EmergencyNumber = require("../models/EmergencyNumber");

exports.getEmergencyNumbers = async (req, res) => {
  try {
    const list = await EmergencyNumber.find().sort({ createdAt: 1 });
    const formatted = list.map((item, idx) => ({
      id: item._id,
      _id: item._id,
      srNo: idx + 1,
      name: item.name,
      number: item.number,
      status: item.status,
    }));
    return res.status(200).json({ success: true, count: formatted.length, data: formatted, list: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getEmergencyNumberById = async (req, res) => {
  try {
    const item = await EmergencyNumber.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Emergency number not found" });
    return res.status(200).json({ success: true, data: item, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createEmergencyNumber = async (req, res) => {
  try {
    const { name, number } = req.body;
    if (!name || !number) {
      return res.status(400).json({ success: false, message: "Name and number are required" });
    }
    const item = await EmergencyNumber.create({ name: name.trim(), number: number.trim() });
    return res.status(201).json({ success: true, message: "Emergency number created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateEmergencyNumber = async (req, res) => {
  try {
    const { name, number } = req.body;
    const item = await EmergencyNumber.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Emergency number not found" });
    if (name) item.name = name.trim();
    if (number) item.number = number.trim();
    await item.save();
    return res.status(200).json({ success: true, message: "Emergency number updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteEmergencyNumber = async (req, res) => {
  try {
    await EmergencyNumber.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Emergency number deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Mobile endpoint - Get Emergency Numbers (PHP fiftyNine / get-emergency-number)
// @route   GET/ALL /api/get-emergency-number
exports.getEmergencyNumbersMobile = async (req, res) => {
  try {
    const list = await EmergencyNumber.find().sort({ createdAt: 1 }).lean();
    const data = list.map((item, idx) => ({
      id: item._id ? String(item._id) : idx + 1,
      _id: item._id,
      name: item.name,
      number: item.number,
      status: item.status || "1",
      created_at: item.createdAt || item.created_at,
      updated_at: item.updatedAt || item.updated_at,
    }));

    return res.status(200).json({
      success: true,
      message: "Data retrieved successfully",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching data",
      error: e.message,
    });
  }
};

