const Tip = require("../models/Tip");

// @desc    Get all tip amounts (Public & Admin)
// @route   GET /api/tips, GET /api/tip
exports.getTips = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      query.$or = [{ status: "1" }, { status: "active" }, { status: { $exists: false } }];
    }

    if (search && search.trim()) {
      const num = Number(search.trim());
      if (!isNaN(num)) {
        query.amount = num;
      }
    }

    const tips = await Tip.find(query).sort({ amount: 1 });
    return res.status(200).json({
      success: true,
      count: tips.length,
      tips: tips.map((t) => ({
        id: t.mysqlId || t._id,
        _id: t._id,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
      })),
    });
  } catch (error) {
    console.error("getTips Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tip by ID
// @route   GET /api/tips/:id
exports.getTipById = async (req, res) => {
  try {
    const { id } = req.params;
    let tip;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      tip = await Tip.findById(id);
    }
    if (!tip && !isNaN(id)) {
      tip = await Tip.findOne({ mysqlId: Number(id) });
    }

    if (!tip) {
      return res.status(404).json({ success: false, message: "Tip amount not found" });
    }

    return res.status(200).json({
      success: true,
      tip: {
        id: tip.mysqlId || tip._id,
        _id: tip._id,
        amount: tip.amount,
        status: tip.status,
      },
    });
  } catch (error) {
    console.error("getTipById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new tip amount
// @route   POST /api/tips
exports.createTip = async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid positive tip amount is required" });
    }

    const last = await Tip.findOne().sort({ mysqlId: -1 });
    const nextId = (last && last.mysqlId ? last.mysqlId : 0) + 1;

    const newTip = await Tip.create({
      mysqlId: nextId,
      amount: numAmount,
      status: "1",
    });

    return res.status(201).json({
      success: true,
      message: "Tip amount added successfully",
      tip: {
        id: newTip.mysqlId || newTip._id,
        _id: newTip._id,
        amount: newTip.amount,
      },
    });
  } catch (error) {
    console.error("createTip Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tip amount
// @route   PUT /api/tips/:id
exports.updateTip = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid positive tip amount is required" });
    }

    let tip;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      tip = await Tip.findById(id);
    }
    if (!tip && !isNaN(id)) {
      tip = await Tip.findOne({ mysqlId: Number(id) });
    }

    if (!tip) {
      return res.status(404).json({ success: false, message: "Tip amount not found" });
    }

    tip.amount = numAmount;
    await tip.save();

    return res.status(200).json({
      success: true,
      message: "Tip amount updated successfully",
      tip: {
        id: tip.mysqlId || tip._id,
        _id: tip._id,
        amount: tip.amount,
      },
    });
  } catch (error) {
    console.error("updateTip Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete tip amount
// @route   DELETE /api/tips/:id
exports.deleteTip = async (req, res) => {
  try {
    const { id } = req.params;
    let tip;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      tip = await Tip.findByIdAndDelete(id);
    }
    if (!tip && !isNaN(id)) {
      tip = await Tip.findOneAndDelete({ mysqlId: Number(id) });
    }

    if (!tip) {
      return res.status(404).json({ success: false, message: "Tip amount not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Tip amount deleted successfully",
    });
  } catch (error) {
    console.error("deleteTip Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mobile endpoint - Get Tips (PHP sixtyfive / get-tips)
// @route   GET/ALL /api/get-tips
exports.getTipsMobile = async (req, res) => {
  try {
    const tips = await Tip.find({
      $or: [{ status: "1" }, { status: "active" }, { status: { $exists: false } }],
    })
      .sort({ amount: 1 })
      .lean();

    if (!tips || tips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found",
      });
    }

    const data = tips.map((t) => ({
      id: t.mysqlId || t._id,
      _id: t._id,
      amount: t.amount,
      status: t.status,
      created_at: t.createdAt || t.created_at,
      updated_at: t.updatedAt || t.updated_at,
    }));

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (ex) {
    console.error("getTipsMobile Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

