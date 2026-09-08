const AboutUsClause = require("../models/AboutUsClause");

exports.getAboutUsClauses = async (req, res) => {
  try {
    const list = await AboutUsClause.find().sort({ createdAt: 1 });
    const formatted = list.map((item, idx) => ({
      id: item._id,
      _id: item._id,
      srNo: idx + 1,
      title: item.title,
      description: item.description,
      status: item.status,
    }));
    return res.status(200).json({ success: true, count: formatted.length, data: formatted, list: formatted });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAboutUsClauseById = async (req, res) => {
  try {
    const item = await AboutUsClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "About Us clause not found" });
    return res.status(200).json({ success: true, data: item, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAboutUsClause = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }
    const item = await AboutUsClause.create({ title: title.trim(), description: description.trim() });
    return res.status(201).json({ success: true, message: "About Us clause created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAboutUsClause = async (req, res) => {
  try {
    const { title, description } = req.body;
    const item = await AboutUsClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "About Us clause not found" });
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    await item.save();
    return res.status(200).json({ success: true, message: "About Us clause updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAboutUsClause = async (req, res) => {
  try {
    await AboutUsClause.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "About Us clause deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
