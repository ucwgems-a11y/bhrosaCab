const express = require("express");
const router = express.Router();
const iconUpload = require("../middleware/iconUpload");
const {
  getIcons,
  getIconById,
  createIcon,
  updateIcon,
  deleteIcon,
} = require("../controllers/iconController");

router.get("/", getIcons);
router.get("/:id", getIconById);
router.post("/", iconUpload.any(), createIcon);
router.put("/:id", iconUpload.any(), updateIcon);
router.delete("/:id", deleteIcon);

module.exports = router;
