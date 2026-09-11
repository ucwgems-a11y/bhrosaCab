const CarType = require("../models/CarType");
const PriceFare = require("../models/PriceFare");
const AutoPrice = require("../models/AutoPrice");
const DriverTopup = require("../models/DriverTopup");
const KilometerPrice = require("../models/KilometerPrice");

// Helper to format image URL
const getRelativeUploadPath = (file) => {
  if (!file) return null;
  return "uploads/carandfare/" + file.filename;
};

const formatImageUrl = (imgPath, req) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
    return imgPath;
  }
  let cleanPath = imgPath.replace(/\\/g, "/");
  if (cleanPath.includes("uploads/")) {
    cleanPath = cleanPath.substring(cleanPath.indexOf("uploads/"));
  }
  const host = req ? req.get("host") : "localhost:5000";
  const protocol = req && req.protocol ? req.protocol : "http";
  return `${protocol}://${host}/${cleanPath}`;
};

/* =========================================================================
   1. CAR TYPES (VEHICLE CATEGORIES) CRUD
   ========================================================================= */

// @desc    Get all car types
// @route   GET /api/cars/types
exports.getCarTypes = async (req, res) => {
  try {
    const types = await CarType.find().sort({ mysqlId: 1, createdAt: 1 });
    const formatted = types.map((t) => ({
      id: t.mysqlId || t._id,
      _id: t._id,
      name: t.typeName,
      typeName: t.typeName,
      status: t.status,
      icon: t.icon ? formatImageUrl(t.icon, req) : null,
      createdAt: t.createdAt,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      types: formatted,
    });
  } catch (error) {
    console.error("getCarTypes Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get car type by ID
// @route   GET /api/cars/types/:id
exports.getCarTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    let type;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      type = await CarType.findById(id);
    }
    if (!type && !isNaN(id)) {
      type = await CarType.findOne({ mysqlId: Number(id) });
    }

    if (!type) {
      return res.status(404).json({ success: false, message: "Vehicle type not found" });
    }

    return res.status(200).json({
      success: true,
      type: {
        id: type.mysqlId || type._id,
        _id: type._id,
        name: type.typeName,
        typeName: type.typeName,
        status: type.status,
      },
    });
  } catch (error) {
    console.error("getCarTypeById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create car type
// @route   POST /api/cars/types
exports.createCarType = async (req, res) => {
  try {
    const { name, typeName } = req.body;
    const finalName = (name || typeName || "").trim();
    if (!finalName) {
      return res.status(400).json({ success: false, message: "Vehicle type name is required" });
    }

    const last = await CarType.findOne().sort({ mysqlId: -1 });
    const nextId = (last && last.mysqlId ? last.mysqlId : 0) + 1;

    const newType = await CarType.create({
      mysqlId: nextId,
      typeName: finalName,
      status: "1",
    });

    return res.status(201).json({
      success: true,
      message: "Vehicle type created successfully",
      type: {
        id: newType.mysqlId,
        _id: newType._id,
        name: newType.typeName,
      },
    });
  } catch (error) {
    console.error("createCarType Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update car type
// @route   PUT /api/cars/types/:id
exports.updateCarType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, typeName } = req.body;
    const finalName = (name || typeName || "").trim();

    let type;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      type = await CarType.findById(id);
    }
    if (!type && !isNaN(id)) {
      type = await CarType.findOne({ mysqlId: Number(id) });
    }

    if (!type) {
      return res.status(404).json({ success: false, message: "Vehicle type not found" });
    }

    if (finalName) {
      type.typeName = finalName;
    }
    await type.save();

    return res.status(200).json({
      success: true,
      message: "Vehicle type updated successfully",
      type: {
        id: type.mysqlId || type._id,
        name: type.typeName,
      },
    });
  } catch (error) {
    console.error("updateCarType Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete car type
// @route   DELETE /api/cars/types/:id
exports.deleteCarType = async (req, res) => {
  try {
    const { id } = req.params;
    let type;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      type = await CarType.findByIdAndDelete(id);
    }
    if (!type && !isNaN(id)) {
      type = await CarType.findOneAndDelete({ mysqlId: Number(id) });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle type deleted successfully",
    });
  } catch (error) {
    console.error("deleteCarType Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   2. PRICE FARE (CARS & FARE RULES) CRUD
   ========================================================================= */

// @desc    Get all price fares
// @route   GET /api/cars/fares
exports.getPriceFares = async (req, res) => {
  try {
    const fares = await PriceFare.find().populate("carType").sort({ mysqlId: 1, createdAt: 1 });
    const carTypes = await CarType.find();
    const typeMap = {};
    carTypes.forEach((c) => {
      typeMap[c.mysqlId] = c.typeName;
    });

    const formatted = fares.map((f) => {
      const typeName = f.carType?.typeName || typeMap[f.vehicleType] || "Vehicle";
      return {
        id: f.mysqlId || f._id,
        _id: f._id,
        vehicleType: String(f.vehicleType),
        vehicleTypeName: typeName,
        farePerKm: f.farePerKm ? `₹ ${Number(f.farePerKm).toFixed(2)}` : "₹ 0.00",
        rawFarePerKm: f.farePerKm || "0.00",
        farePerKmTo: f.farePerKmTo ? `₹ ${Number(f.farePerKmTo).toFixed(2)}` : "₹ 0.00",
        rawFarePerKmTo: f.farePerKmTo || "",
        osAboveDistance: f.outStationAboveKm ? `${f.outStationAboveKm} km` : "0.00 km",
        rawOsAboveDistance: f.outStationAboveKm || "",
        osAbovePrice: f.outStationAbovePrice ? `₹ ${Number(f.outStationAbovePrice).toFixed(2)}` : "₹ 0.00",
        rawOsAbovePrice: f.outStationAbovePrice || "",
        image: f.image ? formatImageUrl(f.image, req) : `https://ui-avatars.com/api/?name=${encodeURIComponent(typeName)}&background=e8873a&color=fff`,
        status: f.status,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      fares: formatted,
    });
  } catch (error) {
    console.error("getPriceFares Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get price fare by ID
// @route   GET /api/cars/fares/:id
exports.getPriceFareById = async (req, res) => {
  try {
    const { id } = req.params;
    let fare;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      fare = await PriceFare.findById(id).populate("carType");
    }
    if (!fare && !isNaN(id)) {
      fare = await PriceFare.findOne({ mysqlId: Number(id) }).populate("carType");
    }

    if (!fare) {
      return res.status(404).json({ success: false, message: "Fare rule not found" });
    }

    const typeObj = fare.carType || (await CarType.findOne({ mysqlId: fare.vehicleType }));

    return res.status(200).json({
      success: true,
      fare: {
        id: fare.mysqlId || fare._id,
        _id: fare._id,
        vehicleType: String(fare.vehicleType),
        vehicleTypeName: typeObj?.typeName || "Vehicle",
        farePerKm: fare.farePerKm || "",
        farePerKmTo: fare.farePerKmTo || "",
        osAboveDistance: fare.outStationAboveKm || "",
        osAbovePrice: fare.outStationAbovePrice || "",
        image: fare.image ? formatImageUrl(fare.image, req) : null,
      },
    });
  } catch (error) {
    console.error("getPriceFareById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create price fare
// @route   POST /api/cars/fares
exports.createPriceFare = async (req, res) => {
  try {
    const {
      vehicleType,
      farePerKm,
      farePerKmTo,
      outStationAboveKm,
      outStationAbovePrice,
    } = req.body;

    const vTypeId = Number(vehicleType || 1);
    const carTypeObj = await CarType.findOne({ mysqlId: vTypeId });

    const last = await PriceFare.findOne().sort({ mysqlId: -1 });
    const nextId = (last && last.mysqlId ? last.mysqlId : 0) + 1;

    let imagePath = null;
    if (req.file) {
      imagePath = getRelativeUploadPath(req.file);
    } else if (req.files && req.files.length > 0) {
      imagePath = getRelativeUploadPath(req.files[0]);
    }

    const newFare = await PriceFare.create({
      mysqlId: nextId,
      vehicleType: vTypeId,
      carType: carTypeObj ? carTypeObj._id : null,
      farePerKm: farePerKm ? Number(farePerKm).toFixed(2) : "0.00",
      farePerKmTo: farePerKmTo ? Number(farePerKmTo).toFixed(2) : null,
      outStationAboveKm: outStationAboveKm ? Number(outStationAboveKm) : null,
      outStationAbovePrice: outStationAbovePrice ? Number(outStationAbovePrice) : 0.0,
      image: imagePath || "uploads/userImage/0d79e902-e1d7-456a-84f8-9f8d1fbe0c45.png",
      status: "1",
    });

    return res.status(201).json({
      success: true,
      message: "Fare rule created successfully",
      fare: newFare,
    });
  } catch (error) {
    console.error("createPriceFare Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update price fare
// @route   PUT /api/cars/fares/:id
exports.updatePriceFare = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicleType,
      farePerKm,
      farePerKmTo,
      outStationAboveKm,
      outStationAbovePrice,
    } = req.body;

    let fare;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      fare = await PriceFare.findById(id);
    }
    if (!fare && !isNaN(id)) {
      fare = await PriceFare.findOne({ mysqlId: Number(id) });
    }

    if (!fare) {
      return res.status(404).json({ success: false, message: "Fare rule not found" });
    }

    if (vehicleType) {
      fare.vehicleType = Number(vehicleType);
      const carTypeObj = await CarType.findOne({ mysqlId: Number(vehicleType) });
      if (carTypeObj) fare.carType = carTypeObj._id;
    }
    if (farePerKm !== undefined) fare.farePerKm = Number(farePerKm).toFixed(2);
    if (farePerKmTo !== undefined) fare.farePerKmTo = farePerKmTo ? Number(farePerKmTo).toFixed(2) : null;
    if (outStationAboveKm !== undefined) fare.outStationAboveKm = outStationAboveKm ? Number(outStationAboveKm) : null;
    if (outStationAbovePrice !== undefined) fare.outStationAbovePrice = outStationAbovePrice ? Number(outStationAbovePrice) : 0.0;

    if (req.file) {
      fare.image = getRelativeUploadPath(req.file);
    } else if (req.files && req.files.length > 0) {
      fare.image = getRelativeUploadPath(req.files[0]);
    }

    await fare.save();

    return res.status(200).json({
      success: true,
      message: "Fare rule updated successfully",
      fare,
    });
  } catch (error) {
    console.error("updatePriceFare Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete price fare
// @route   DELETE /api/cars/fares/:id
exports.deletePriceFare = async (req, res) => {
  try {
    const { id } = req.params;
    let fare;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      fare = await PriceFare.findByIdAndDelete(id);
    }
    if (!fare && !isNaN(id)) {
      fare = await PriceFare.findOneAndDelete({ mysqlId: Number(id) });
    }

    return res.status(200).json({
      success: true,
      message: "Fare rule deleted successfully",
    });
  } catch (error) {
    console.error("deletePriceFare Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   3. AUTO PRICE CRUD
   ========================================================================= */

// @desc    Get all auto prices
// @route   GET /api/cars/auto-prices
exports.getAutoPrices = async (req, res) => {
  try {
    const prices = await AutoPrice.find().sort({ mysqlId: 1, createdAt: 1 });
    const formatted = prices.map((p) => ({
      id: p.mysqlId || p._id,
      _id: p._id,
      state: p.state || p.city || "N/A",
      city: p.city || "",
      price: p.price,
      farePerKm: `₹ ${p.price}`,
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      prices: formatted,
    });
  } catch (error) {
    console.error("getAutoPrices Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create auto price
// @route   POST /api/cars/auto-prices
exports.createAutoPrice = async (req, res) => {
  try {
    const { state, city, price } = req.body;
    const last = await AutoPrice.findOne().sort({ mysqlId: -1 });
    const nextId = (last && last.mysqlId ? last.mysqlId : 0) + 1;

    const newPrice = await AutoPrice.create({
      mysqlId: nextId,
      state: state || null,
      city: city || null,
      price: Number(price || 0),
    });

    return res.status(201).json({
      success: true,
      message: "Auto price created successfully",
      price: newPrice,
    });
  } catch (error) {
    console.error("createAutoPrice Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete auto price
// @route   DELETE /api/cars/auto-prices/:id
exports.deleteAutoPrice = async (req, res) => {
  try {
    const { id } = req.params;
    let p;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      p = await AutoPrice.findByIdAndDelete(id);
    }
    if (!p && !isNaN(id)) {
      p = await AutoPrice.findOneAndDelete({ mysqlId: Number(id) });
    }

    return res.status(200).json({
      success: true,
      message: "Auto price deleted successfully",
    });
  } catch (error) {
    console.error("deleteAutoPrice Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================================================================
   4. DRIVER TOPUP CRUD
   ========================================================================= */

// @desc    Get all driver topups
// @route   GET /api/cars/topups
exports.getDriverTopups = async (req, res) => {
  try {
    const topups = await DriverTopup.find().populate("carType").sort({ mysqlId: 1, createdAt: 1 });
    const carTypes = await CarType.find();
    const typeMap = {};
    carTypes.forEach((c) => {
      typeMap[c.mysqlId] = c.typeName;
    });

    const formatted = topups.map((t) => {
      const typeName = t.carType?.typeName || typeMap[t.carTypeId] || "Vehicle";
      return {
        id: t.mysqlId || t._id,
        _id: t._id,
        carTypeId: String(t.carTypeId),
        vehicleType: typeName,
        topupAmount: `₹ ${t.topupAmount}`,
        rawTopupAmount: t.topupAmount,
        slabs: t.slabs ? `₹ ${t.slabs}` : "NULL",
        rawSlabs: t.slabs || "",
        timeLimit: t.timeLimit ? `${t.timeLimit} Minutes ( ${Math.round(t.timeLimit / 60)} Hours )`: "NULL",
        rawTimeLimit: t.timeLimit || "",
        aboveDistance: t.aboveDistance ? `${t.aboveDistance} km` : "NULL",
        rawAboveDistance: t.aboveDistance || "",
        extraCharge: t.extraCharge ? `${t.extraCharge}%` : "0%",
        rawExtraCharge: t.extraCharge || "",
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      topups: formatted,
    });
  } catch (error) {
    console.error("getDriverTopups Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get driver topup by ID
// @route   GET /api/cars/topups/:id
exports.getDriverTopupById = async (req, res) => {
  try {
    const { id } = req.params;
    let t;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      t = await DriverTopup.findById(id).populate("carType");
    }
    if (!t && !isNaN(id)) {
      t = await DriverTopup.findOne({ mysqlId: Number(id) }).populate("carType");
    }

    if (!t) {
      return res.status(404).json({ success: false, message: "Driver topup not found" });
    }

    const typeObj = t.carType || (await CarType.findOne({ mysqlId: t.carTypeId }));

    return res.status(200).json({
      success: true,
      topup: {
        id: t.mysqlId || t._id,
        _id: t._id,
        vehicleType: String(t.carTypeId),
        vehicleTypeName: typeObj?.typeName || "Vehicle",
        topupAmount: t.topupAmount || "",
        slabs: t.slabs || "",
        timeLimit: t.timeLimit || "",
        aboveDistance: t.aboveDistance || "",
        extraCharge: t.extraCharge || "",
      },
    });
  } catch (error) {
    console.error("getDriverTopupById Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create driver topup
// @route   POST /api/cars/topups
exports.createDriverTopup = async (req, res) => {
  try {
    const {
      vehicleType,
      carTypeId,
      topupAmount,
      slabs,
      timeLimit,
      aboveDistance,
      extraCharge,
    } = req.body;

    const vTypeId = Number(vehicleType || carTypeId || 1);
    const carTypeObj = await CarType.findOne({ mysqlId: vTypeId });

    const last = await DriverTopup.findOne().sort({ mysqlId: -1 });
    const nextId = (last && last.mysqlId ? last.mysqlId : 0) + 1;

    const newTopup = await DriverTopup.create({
      mysqlId: nextId,
      carTypeId: vTypeId,
      carType: carTypeObj ? carTypeObj._id : null,
      topupAmount: Number(topupAmount || 0),
      slabs: slabs ? String(slabs) : null,
      timeLimit: timeLimit ? String(timeLimit) : "720",
      aboveDistance: aboveDistance ? String(aboveDistance) : "25",
      extraCharge: extraCharge ? String(extraCharge) : "12",
    });

    return res.status(201).json({
      success: true,
      message: "Driver topup created successfully",
      topup: newTopup,
    });
  } catch (error) {
    console.error("createDriverTopup Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update driver topup
// @route   PUT /api/cars/topups/:id
exports.updateDriverTopup = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicleType,
      carTypeId,
      topupAmount,
      slabs,
      timeLimit,
      aboveDistance,
      extraCharge,
    } = req.body;

    let t;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      t = await DriverTopup.findById(id);
    }
    if (!t && !isNaN(id)) {
      t = await DriverTopup.findOne({ mysqlId: Number(id) });
    }

    if (!t) {
      return res.status(404).json({ success: false, message: "Driver topup not found" });
    }

    if (vehicleType || carTypeId) {
      const vTypeId = Number(vehicleType || carTypeId);
      t.carTypeId = vTypeId;
      const carTypeObj = await CarType.findOne({ mysqlId: vTypeId });
      if (carTypeObj) t.carType = carTypeObj._id;
    }
    if (topupAmount !== undefined) t.topupAmount = Number(topupAmount);
    if (slabs !== undefined) t.slabs = slabs ? String(slabs) : null;
    if (timeLimit !== undefined) t.timeLimit = timeLimit ? String(timeLimit) : null;
    if (aboveDistance !== undefined) t.aboveDistance = aboveDistance ? String(aboveDistance) : null;
    if (extraCharge !== undefined) t.extraCharge = extraCharge ? String(extraCharge) : null;

    await t.save();

    return res.status(200).json({
      success: true,
      message: "Driver topup updated successfully",
      topup: t,
    });
  } catch (error) {
    console.error("updateDriverTopup Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete driver topup
// @route   DELETE /api/cars/topups/:id
exports.deleteDriverTopup = async (req, res) => {
  try {
    const { id } = req.params;
    let t;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      t = await DriverTopup.findByIdAndDelete(id);
    }
    if (!t && !isNaN(id)) {
      t = await DriverTopup.findOneAndDelete({ mysqlId: Number(id) });
    }

    return res.status(200).json({
      success: true,
      message: "Driver topup deleted successfully",
    });
  } catch (error) {
    console.error("deleteDriverTopup Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Function 119: getVehicleFaresDetails
 * PHP: eightySix
 * Route: GET /api/vehice-details
 */
exports.getVehicleFaresDetails = async (req, res) => {
  try {
    const fares = await PriceFare.find().populate("carType").sort({ mysqlId: 1, createdAt: 1 });
    const carTypes = await CarType.find();
    const typeMap = {};
    carTypes.forEach((c) => {
      typeMap[c.mysqlId] = c.typeName;
    });

    const host = req ? req.get("host") : "localhost:5000";
    const protocol = req && req.protocol ? req.protocol : "http";

    const formatted = fares.map((f) => {
      const typeName = f.carType?.typeName || typeMap[f.vehicleType] || "";
      let img = f.image || null;
      if (img && !img.startsWith("http://") && !img.startsWith("https://")) {
        let cleanPath = img.replace(/\\/g, "/");
        if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);
        img = `${protocol}://${host}/${cleanPath}`;
      }
      return {
        id: f.mysqlId || f._id,
        vehicle_type: f.vehicleType,
        vehicle_type_name: typeName,
        fare_per_km: f.farePerKm ? String(f.farePerKm) : "0.00",
        image: img,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Fare list fetched successfully",
      details: formatted,
    });
  } catch (ex) {
    console.error("EightySix API Error: " + ex.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong. Please try again later",
    });
  }
};

/**
 * Function 125: getKilometerPrices
 * PHP: get_kilometer_price
 * Route: ALL /api/get-kilometer-price
 */
exports.getKilometerPrices = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const kilometerPrices = await KilometerPrice.find().populate("carType");

    return res.status(200).json({
      message: "Kilometer prices retrieved successfully",
      data: kilometerPrices,
    });
  } catch (ex) {
    console.error("Error in get_kilometer_price:", ex);
    return res.status(500).json({
      message: "An error occurred while fetching kilometer prices",
    });
  }
};
exports.get_kilometer_price = exports.getKilometerPrices;


