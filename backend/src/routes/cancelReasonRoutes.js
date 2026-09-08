const express = require("express");
const router = express.Router();
const cancelReasonController = require("../controllers/cancelReasonController");

router.get("/", cancelReasonController.getCancelReasons);
router.get("/:id", cancelReasonController.getCancelReasonById);
router.post("/", cancelReasonController.createCancelReason);
router.put("/:id", cancelReasonController.updateCancelReason);
router.delete("/:id", cancelReasonController.deleteCancelReason);

module.exports = router;
