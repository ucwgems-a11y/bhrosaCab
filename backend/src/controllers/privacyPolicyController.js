const PrivacyPolicyClause = require("../models/PrivacyPolicyClause");

exports.getPrivacyPolicies = async (req, res) => {
  try {
    const list = await PrivacyPolicyClause.find().sort({ createdAt: 1 });
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

exports.getPrivacyPolicyById = async (req, res) => {
  try {
    const item = await PrivacyPolicyClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Privacy policy clause not found" });
    return res.status(200).json({ success: true, data: item, item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPrivacyPolicy = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }
    const item = await PrivacyPolicyClause.create({ title: title.trim(), description: description.trim() });
    return res.status(201).json({ success: true, message: "Privacy policy clause created successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePrivacyPolicy = async (req, res) => {
  try {
    const { title, description } = req.body;
    const item = await PrivacyPolicyClause.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Privacy policy clause not found" });
    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    await item.save();
    return res.status(200).json({ success: true, message: "Privacy policy clause updated successfully", data: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePrivacyPolicy = async (req, res) => {
  try {
    await PrivacyPolicyClause.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Privacy policy clause deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Mobile App Privacy Policy Endpoint
 * Equivalent to PHP: Route::any('get-privacy-policy', 'fourteen')
 */
exports.getPrivacyPolicyMobile = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const data = await PrivacyPolicyClause.find().sort({ createdAt: 1 });
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    return res.status(200).json({
      message: "Data Retrieved Successfully",
      details: data,
    });
  } catch (ex) {
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

