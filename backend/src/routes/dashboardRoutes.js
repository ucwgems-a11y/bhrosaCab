const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/verifyAdmin");
const dashboardController = require("../controllers/dashboardController");

// Dashboard Analytics & Stats
router.get("/analytics", verifyAdmin, dashboardController.getDashboardAnalytics);
router.get("/stats", verifyAdmin, dashboardController.getDashboardAnalytics);

// Min Driver Wallet Configuration
router.get("/min-wallet", verifyAdmin, dashboardController.getMinWallet);
router.post("/min-wallet", verifyAdmin, dashboardController.updateMinWallet);
router.put("/min-wallet", verifyAdmin, dashboardController.updateMinWallet);

module.exports = router;
