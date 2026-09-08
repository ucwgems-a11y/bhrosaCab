const express = require("express");
const router = express.Router();
const tipController = require("../controllers/tipController");

router.get("/", tipController.getTips);
router.get("/:id", tipController.getTipById);
router.post("/", tipController.createTip);
router.put("/:id", tipController.updateTip);
router.delete("/:id", tipController.deleteTip);

module.exports = router;
