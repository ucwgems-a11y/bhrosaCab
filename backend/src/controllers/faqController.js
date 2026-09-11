const Faq = require("../models/Faq");

// @desc    Get all FAQs (Public & Admin)
// @route   GET /api/faqs, GET /api/faq
exports.getFaqs = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    } else {
      query.$or = [{ status: "1" }, { status: "active" }, { status: { $exists: false } }];
    }

    if (category) {
      query.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { question: { $regex: q, $options: "i" } },
        { answer: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, faqs] = await Promise.all([
      Faq.countDocuments(query),
      Faq.find(query).sort({ order: 1, createdAt: 1 }).skip(skip).limit(limitNum),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      faqs: faqs.map((f) => ({
        id: f.mysqlId || f._id,
        _id: f._id,
        question: f.question,
        answer: f.answer,
        category: f.category,
        order: f.order,
        status: f.status,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error("getFaqs Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get FAQ by ID
// @route   GET /api/faqs/:id
exports.getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    let faq;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faq = await Faq.findById(id);
    }
    if (!faq && !isNaN(id)) {
      faq = await Faq.findOne({ mysqlId: Number(id) });
    }

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    return res.status(200).json({
      success: true,
      faq: {
        id: faq.mysqlId || faq._id,
        _id: faq._id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
      },
    });
  } catch (error) {
    console.error("getFaqById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new FAQ
// @route   POST /api/faqs
exports.createFaq = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;
    const qText = (question || "").trim();
    const aText = (answer || "").trim();

    if (!qText || !aText) {
      return res.status(400).json({ success: false, message: "Both question and answer are required" });
    }

    const last = await Faq.findOne().sort({ mysqlId: -1 });
    const nextId = (last && last.mysqlId ? last.mysqlId : 0) + 1;

    const newFaq = await Faq.create({
      mysqlId: nextId,
      question: qText,
      answer: aText,
      category: category || "general",
      order: Number(order) || 0,
      status: "1",
    });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      faq: {
        id: newFaq.mysqlId || newFaq._id,
        _id: newFaq._id,
        question: newFaq.question,
        answer: newFaq.answer,
      },
    });
  } catch (error) {
    console.error("createFaq Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update FAQ
// @route   PUT /api/faqs/:id
exports.updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, order } = req.body;
    const qText = (question || "").trim();
    const aText = (answer || "").trim();

    if (!qText || !aText) {
      return res.status(400).json({ success: false, message: "Both question and answer are required" });
    }

    let faq;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faq = await Faq.findById(id);
    }
    if (!faq && !isNaN(id)) {
      faq = await Faq.findOne({ mysqlId: Number(id) });
    }

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    faq.question = qText;
    faq.answer = aText;
    if (category) faq.category = category;
    if (order !== undefined) faq.order = Number(order);
    await faq.save();

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      faq: {
        id: faq.mysqlId || faq._id,
        _id: faq._id,
        question: faq.question,
        answer: faq.answer,
      },
    });
  } catch (error) {
    console.error("updateFaq Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete FAQ
// @route   DELETE /api/faqs/:id
exports.deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    let faq;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      faq = await Faq.findByIdAndDelete(id);
    }
    if (!faq && !isNaN(id)) {
      faq = await Faq.findOneAndDelete({ mysqlId: Number(id) });
    }

    if (!faq) {
      return res.status(404).json({ success: false, message: "FAQ not found" });
    }

    return res.status(200).json({
      success: true,
      message: "FAQ deleted successfully",
    });
  } catch (error) {
    console.error("deleteFaq Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mobile endpoint - Get FAQ List (PHP fiftyEight / get-FAQ-list)
// @route   GET /api/get-FAQ-list
exports.getFaqList = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const type = req.query.type || req.body?.type;
    let query = {};
    if (type) {
      query.$or = [
        { type: String(type) },
        { category: String(type) },
      ];
    }

    const faqs = await Faq.find(query).sort({ order: 1, createdAt: 1 }).lean();

    if (!faqs || faqs.length === 0) {
      return res.status(404).json({
        message: "No FAQ records found",
      });
    }

    const data = faqs.map((f) => ({
      id: f.mysqlId || f._id,
      _id: f._id,
      question: f.question,
      answer: f.answer,
      category: f.category || f.type || "general",
      type: f.type || f.category || "general",
      order: f.order || 0,
      status: f.status || "1",
      created_at: f.createdAt,
      updated_at: f.updatedAt,
    }));

    return res.status(200).json({
      message: "FAQ get successfully",
      Data: data,
    });
  } catch (ex) {
    console.error("getFaqList Error:", ex);
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

