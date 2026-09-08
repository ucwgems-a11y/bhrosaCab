const Promo = require("../models/Promo");

const computePromoStatus = (startDate, endDate, status) => {
  if (status === "Inactive" || status === "0") return "Inactive";
  const today = new Date().toISOString().split("T")[0];
  if (startDate && today < startDate) return "Coming Soon";
  if (endDate && today > endDate) return "Expired";
  return "Active";
};

exports.getPromos = async (req, res) => {
  try {
    const { search } = req.query;
    let filter = {};
    if (search && search.trim()) {
      const q = search.trim();
      filter = {
        $or: [
          { code: { $regex: q, $options: "i" } },
          { title: { $regex: q, $options: "i" } },
        ],
      };
    }

    const list = await Promo.find(filter).sort({ createdAt: -1 });
    const formatted = list.map((item, idx) => {
      const dynamicStatus = computePromoStatus(item.startDate, item.endDate, item.status);
      return {
        id: item._id,
        _id: item._id,
        srNo: idx + 1,
        code: item.code,
        title: item.title,
        discount: item.discount + "%",
        rawDiscount: item.discount,
        startDate: item.startDate,
        endDate: item.endDate,
        start: item.startDate,
        end: item.endDate,
        status: dynamicStatus,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
      list: formatted,
      promos: formatted,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPromoById = async (req, res) => {
  try {
    const item = await Promo.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Promo not found" });
    const dynamicStatus = computePromoStatus(item.startDate, item.endDate, item.status);
    return res.status(200).json({
      success: true,
      data: {
        ...item._doc,
        id: item._id,
        rawDiscount: item.discount,
        status: dynamicStatus,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.createPromo = async (req, res) => {
  try {
    const { code, promoCode, title, discount, startDate, endDate, status } = req.body;
    const finalCode = (code || promoCode || "").trim().toUpperCase();

    if (!finalCode || !title || !discount || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Code, Title, Discount percentage, Start date and End date are required",
      });
    }

    const existing = await Promo.findOne({ code: finalCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Promo code '${finalCode}' already exists`,
      });
    }

    const numDiscount = Number(String(discount).replace(/[^0-9.]/g, ""));
    const item = await Promo.create({
      code: finalCode,
      title: title.trim(),
      discount: isNaN(numDiscount) ? 10 : numDiscount,
      startDate,
      endDate,
      status: status || "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Promo code created successfully",
      data: item,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePromo = async (req, res) => {
  try {
    const { code, promoCode, title, discount, startDate, endDate, status } = req.body;
    const item = await Promo.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Promo not found" });

    const finalCode = (code || promoCode || "").trim().toUpperCase();
    if (finalCode && finalCode !== item.code) {
      const duplicate = await Promo.findOne({ code: finalCode, _id: { $ne: item._id } });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Promo code '${finalCode}' already exists on another coupon`,
        });
      }
      item.code = finalCode;
    }

    if (title) item.title = title.trim();
    if (discount !== undefined && discount !== "") {
      const numDiscount = Number(String(discount).replace(/[^0-9.]/g, ""));
      if (!isNaN(numDiscount)) item.discount = numDiscount;
    }
    if (startDate) item.startDate = startDate;
    if (endDate) item.endDate = endDate;
    if (status) item.status = status;

    await item.save();
    return res.status(200).json({
      success: true,
      message: "Promo code updated successfully",
      data: item,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deletePromo = async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Promo code deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
