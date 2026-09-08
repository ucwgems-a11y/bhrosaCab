const express = require("express");
const router = express.Router();
const carUpload = require("../middleware/carUpload");
const {
  getCarTypes,
  getCarTypeById,
  createCarType,
  updateCarType,
  deleteCarType,
  getPriceFares,
  getPriceFareById,
  createPriceFare,
  updatePriceFare,
  deletePriceFare,
  getAutoPrices,
  createAutoPrice,
  deleteAutoPrice,
  getDriverTopups,
  getDriverTopupById,
  createDriverTopup,
  updateDriverTopup,
  deleteDriverTopup,
} = require("../controllers/carController");

// 1. Car Types
router.get("/types", getCarTypes);
router.get("/types/:id", getCarTypeById);
router.post("/types", createCarType);
router.put("/types/:id", updateCarType);
router.delete("/types/:id", deleteCarType);

// 2. Price Fares
router.get("/fares", getPriceFares);
router.get("/fares/:id", getPriceFareById);
router.post("/fares", carUpload.any(), createPriceFare);
router.put("/fares/:id", carUpload.any(), updatePriceFare);
router.delete("/fares/:id", deletePriceFare);

// 3. Auto Prices
router.get("/auto-prices", getAutoPrices);
router.get("/auto-price", getAutoPrices);
router.post("/auto-prices", createAutoPrice);
router.delete("/auto-prices/:id", deleteAutoPrice);

// 4. Driver Topup
router.get("/topups", getDriverTopups);
router.get("/driver-topup", getDriverTopups);
router.get("/topups/:id", getDriverTopupById);
router.post("/topups", createDriverTopup);
router.put("/topups/:id", updateDriverTopup);
router.delete("/topups/:id", deleteDriverTopup);

module.exports = router;
