const express = require("express");
const router = express.Router();
const {
  getPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
} = require("../controllers/promoController");

router.get("/", getPromos);
router.get("/:id", getPromoById);
router.post("/", createPromo);
router.put("/:id", updatePromo);
router.delete("/:id", deletePromo);

module.exports = router;
