const express = require("express");
const router = express.Router();
const carUpload = require("../middleware/carUpload");
const verifyAdmin = require("../middleware/verifyAdmin");
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
  getVehicleFaresDetails,
  getKilometerPrices,
} = require("../controllers/carController");

// 1. Car Types
router.get("/types", getCarTypes);
router.get("/types/:id", getCarTypeById);
router.post("/types", verifyAdmin, createCarType);
router.put("/types/:id", verifyAdmin, updateCarType);
router.delete("/types/:id", verifyAdmin, deleteCarType);

// 2. Price Fares
router.get("/fares", getPriceFares);
router.get("/fares/:id", getPriceFareById);
router.post("/fares", verifyAdmin, carUpload.any(), createPriceFare);
router.put("/fares/:id", verifyAdmin, carUpload.any(), updatePriceFare);
router.delete("/fares/:id", verifyAdmin, deletePriceFare);
router.all("/vehice-details", getVehicleFaresDetails);
router.all("/vehicle-details", getVehicleFaresDetails);
router.all("/get-kilometer-price", getKilometerPrices);

// 3. Auto Prices
router.get("/auto-prices", getAutoPrices);
router.get("/auto-price", getAutoPrices);
router.post("/auto-prices", verifyAdmin, createAutoPrice);
router.delete("/auto-prices/:id", verifyAdmin, deleteAutoPrice);

// 4. Driver Topup
router.get("/topups", getDriverTopups);
router.get("/driver-topup", getDriverTopups);
router.get("/topups/:id", getDriverTopupById);
router.post("/topups", verifyAdmin, createDriverTopup);
router.put("/topups/:id", verifyAdmin, updateDriverTopup);
router.delete("/topups/:id", verifyAdmin, deleteDriverTopup);

module.exports = router;
