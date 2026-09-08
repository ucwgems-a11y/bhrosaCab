const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Dashboard Analytics & Stats
router.get("/analytics", dashboardController.getDashboardAnalytics);
router.get("/stats", dashboardController.getDashboardAnalytics);

// Min Driver Wallet Configuration
router.get("/min-wallet", dashboardController.getMinWallet);
router.post("/min-wallet", dashboardController.updateMinWallet);
router.put("/min-wallet", dashboardController.updateMinWallet);

module.exports = router;
