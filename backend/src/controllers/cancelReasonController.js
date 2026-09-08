const CancelReason = require("../models/CancelReason");

// @desc    Get all cancellation reasons (Public & Admin)
// @route   GET /api/cancel-reasons, GET /api/cancel-reason
exports.getCancelReasons = async (req, res) => {
  try {
    const { search, type, status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      query.$or = [{ status: "1" }, { status: "active" }, { status: { $exists: false } }];
    }

    if (type) {
      query.type = { $in: [type, "all"] };
    }

    if (search && search.trim()) {
      query.reason = { $regex: search.trim(), $options: "i" };
    }

    const reasons = await CancelReason.find(query).sort({ createdAt: 1 });
    return res.status(200).json({
      success: true,
      count: reasons.length,
      reasons: reasons.map((r) => ({
        id: r.mysqlId || r._id,
        _id: r._id,
        reason: r.reason,
        type: r.type,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("getCancelReasons Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get cancel reason by ID
// @route   GET /api/cancel-reasons/:id
exports.getCancelReasonById = async (req, res) => {
  try {
    const { id } = req.params;
    let reason;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      reason = await CancelReason.findById(id);
    }
    if (!reason && !isNaN(id)) {
      reason = await CancelReason.findOne({ mysqlId: Number(id) });
    }

    if (!reason) {
      return res.status(404).json({ success: false, message: "Cancel reason not found" });
    }

    return res.status(200).json({
      success: true,
      reason: {
        id: reason.mysqlId || reason._id,
        _id: reason._id,
        reason: reason.reason,
        type: reason.type,
      },
    });
  } catch (error) {
    console.error("getCancelReasonById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new cancel reason
// @route   POST /api/cancel-reasons
exports.createCancelReason = async (req, res) => {
  try {
    const { reason, type } = req.body;
    const text = (reason || "").trim();

    if (!text) {
      return res.status(400).json({ success: false, message: "Cancellation reason text is required" });
    }

    const last = await CancelReason.findOne().sort({ mysqlId: -1 });
    const nextId = (last && last.mysqlId ? last.mysqlId : 0) + 1;

    const newReason = await CancelReason.create({
      mysqlId: nextId,
      reason: text,
      type: type || "user",
      status: "1",
    });

    return res.status(201).json({
      success: true,
      message: "Cancel reason created successfully",
      reason: {
        id: newReason.mysqlId || newReason._id,
        _id: newReason._id,
        reason: newReason.reason,
      },
    });
  } catch (error) {
    console.error("createCancelReason Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cancel reason
// @route   PUT /api/cancel-reasons/:id
exports.updateCancelReason = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, type } = req.body;
    const text = (reason || "").trim();

    if (!text) {
      return res.status(400).json({ success: false, message: "Cancellation reason text is required" });
    }

    let item;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await CancelReason.findById(id);
    }
    if (!item && !isNaN(id)) {
      item = await CancelReason.findOne({ mysqlId: Number(id) });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: "Cancel reason not found" });
    }

    item.reason = text;
    if (type) item.type = type;
    await item.save();

    return res.status(200).json({
      success: true,
      message: "Cancel reason updated successfully",
      reason: {
        id: item.mysqlId || item._id,
        _id: item._id,
        reason: item.reason,
      },
    });
  } catch (error) {
    console.error("updateCancelReason Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete cancel reason
// @route   DELETE /api/cancel-reasons/:id
exports.deleteCancelReason = async (req, res) => {
  try {
    const { id } = req.params;
    let item;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      item = await CancelReason.findByIdAndDelete(id);
    }
    if (!item && !isNaN(id)) {
      item = await CancelReason.findOneAndDelete({ mysqlId: Number(id) });
    }

    if (!item) {
      return res.status(404).json({ success: false, message: "Cancel reason not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Cancel reason deleted successfully",
    });
  } catch (error) {
    console.error("deleteCancelReason Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
