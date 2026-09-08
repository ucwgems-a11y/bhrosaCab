const TermsConditionClause = require("../models/TermsConditionClause");

exports.getTermsConditions = async (req, res) => {
  try {
    const list = await TermsConditionClause.find().sort({ createdAt: 1 });
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

exports.getTermsConditionById = async (req, res) => {
  try {
    const item = await TermsConditionClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Terms & Conditions clause not found" });
    return res.status(200).json({ success: true, data: item, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTermsCondition = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }
    const item = await TermsConditionClause.create({ title: title.trim(), description: description.trim() });
    return res.status(201).json({ success: true, message: "Terms & Conditions clause created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateTermsCondition = async (req, res) => {
  try {
    const { title, description } = req.body;
    const item = await TermsConditionClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Terms & Conditions clause not found" });
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    await item.save();
    return res.status(200).json({ success: true, message: "Terms & Conditions clause updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteTermsCondition = async (req, res) => {
  try {
    await TermsConditionClause.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Terms & Conditions clause deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
