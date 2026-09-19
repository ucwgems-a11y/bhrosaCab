const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const {
  getPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  getPromoDetail,
} = require("../controllers/promoController");

router.all("/get-promo-detail", getPromoDetail);
router.get("/", verifyAdmin, getPromos);
router.get("/:id", verifyAdmin, getPromoById);
router.post("/", verifyAdmin, createPromo);
router.put("/:id", verifyAdmin, updatePromo);
router.delete("/:id", verifyAdmin, deletePromo);

module.exports = router;
