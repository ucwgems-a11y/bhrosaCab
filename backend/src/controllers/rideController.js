/**
 * Ride & Booking Controller
 * Handles vehicle types, price calculation, booking creation, ride management, and cancellations.
 */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Ride = require("../models/Ride");
const User = require("../models/User");
const Driver = require("../models/Driver");
const CarType = require("../models/CarType");
const PriceFare = require("../models/PriceFare");
const DriverTopup = require("../models/DriverTopup");
const DriverWalletRecharge = require("../models/DriverWalletRecharge");
const UserRideCancel = require("../models/UserRideCancel");
const SendLocation = require("../models/SendLocation");
const Promo = require("../models/Promo");

// Helper to format clean image URL with domain
function formatImageUrl(image, req) {
  if (!image) return null;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  let cleanPath = image.replace(/\\/g, "/");
  if (cleanPath.includes("uploads/")) {
    cleanPath = cleanPath.substring(cleanPath.indexOf("uploads/"));
  } else {
    cleanPath = cleanPath.replace(/^\/+/, "");
  }
  const host = req ? req.get("host") : "localhost:5000";
  const protocol = req && req.protocol ? req.protocol : "http";
  return `${protocol}://${host}/${cleanPath}`;
}

// 1. GET VEHICLE TYPES & FARES
// Equivalent to PHP: Route::any('get-vehicle-types', 'get_vehicle_types')
const getVehicleTypes = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const fares = await PriceFare.find().populate("carType");

    const data = fares.map((item) => ({
      id: item._id,
      vehicle_type_id: item.vehicleType,
      vehicle_type_name: item.carType?.typeName || null,
      fare_per_km: item.farePerKm,
      fare_per_km_to: item.farePerKmTo,
      outStationAboveKm: item.outStationAboveKm,
      outStationAbovePrice: item.outStationAbovePrice,
      image: formatImageUrl(item.image),
      created_at: item.createdAt || item.created_at,
      updated_at: item.updatedAt || item.updated_at,
    }));

    return res.status(200).json({
      message: "Price fares retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("Error in get_price_fares:", error);
    return res.status(500).json({
      message: "An error occurred while fetching price fares",
    });
  }
};

// 2. GET VEHICLE TYPE FARE (Estimated Fare Calculation)
// Equivalent to PHP: Route::any('get-vehicle-type-fare', 'get_vehicle_type_fare')
const getVehicleTypeFare = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const body = req.body || {};
    const fromLat = body.fromLat || req?.query?.fromLat;
    const fromLng = body.fromLng || req?.query?.fromLng;
    const toLat = body.toLat || req?.query?.toLat;
    const toLng = body.toLng || req?.query?.toLng;
    const distance = body.distance || req?.query?.distance;
    const numDistance = parseFloat(distance) || 0;

    const fares = await PriceFare.find().populate("carType");
    const result = [];

    for (const fare of fares) {
      const carType = fare.carType || (await CarType.findById(fare.vehicleType));
      const image = formatImageUrl(fare.image);

      let farePerKm = 0;
      let total_price = 0;

      // Minimum fare for first 2 KM
      if (numDistance <= 2) {
        const typeId = carType?.mysqlId || carType?.vehicle_type;
        if (typeId === 1) {
          total_price = 30; // Bike
        } else if (typeId === 2) {
          total_price = 40; // Auto
        } else {
          total_price = 90; // Cars / SUVs
        }
        farePerKm = Math.round((total_price / Math.max(numDistance, 1)) * 100) / 100;
      }
      // Outstation Above KM
      else if (fare.outStationAboveKm && numDistance > fare.outStationAboveKm) {
        farePerKm = fare.outStationAbovePrice || 0;
        total_price = farePerKm * numDistance;
      }
      // Normal Fare Range
      else {
        const minFare = parseFloat(fare.farePerKm) || 0;
        const maxFare = parseFloat(fare.farePerKmTo) || 0;

        let random_fare = minFare;
        if (minFare === 0 && maxFare === 0) {
          random_fare = 0;
        } else if (minFare === 0) {
          random_fare = maxFare;
        } else if (maxFare === 0) {
          random_fare = minFare;
        } else {
          const low = Math.min(minFare, maxFare);
          const high = Math.max(minFare, maxFare);
          random_fare = Math.floor(Math.random() * (high - low + 1)) + low;
        }

        farePerKm = random_fare;
        total_price = numDistance * random_fare;
      }

      result.push({
        id: carType?.mysqlId || carType?._id,
        vehicle_id: carType?.mysqlId || carType?._id,
        vehicle_mongo_id: carType?._id,
        vehicle_name: carType?.typeName || "Car",
        vehicle_image: image,
        fare_per_km: farePerKm,
        total_price: Math.round(total_price),
      });
    }

    return res.status(200).json({
      message: "Vehicle fares fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getVehicleTypeFare:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// @desc    Get Vehicle Type Prices based on User Location & Live Drivers (PHP: ApiController::twentyNine)
// @route   GET /api/get-vehicle-type-price
const getVehicleTypePrice = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    // Retrieve user's latest saved location
    const location = await SendLocation.findOne({
      $or: [{ user_id: user._id }, { user_id: String(user._id) }],
    }).sort({ createdAt: -1 });

    if (!location) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    const fromLat = parseFloat(location.from_latitude);
    const fromLng = parseFloat(location.from_longitude);
    const destLat = parseFloat(location.destination_latitude);
    const destLng = parseFloat(location.destination_longitude);

    let distance = 0;
    if (
      !isNaN(fromLat) &&
      !isNaN(fromLng) &&
      !isNaN(destLat) &&
      !isNaN(destLng)
    ) {
      const earthRadius = 6371; // in KM
      const dLat = ((destLat - fromLat) * Math.PI) / 180;
      const dLon = ((destLng - fromLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((fromLat * Math.PI) / 180) *
          Math.cos((destLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distance = Math.round(earthRadius * c * 100) / 100;
    }

    // Coupon calculation
    const couponId = req.query.coupon_id || location.coupon_id;
    let discountPercentage = 0;
    if (couponId) {
      const coupon = await Promo.findById(couponId);
      if (coupon) {
        discountPercentage = Number(coupon.discount) || 0;
        location.coupon_id = couponId;
        await location.save();
      }
    }

    // Find active vehicle categories from online drivers
    const activeDrivers = await Driver.find({
      active_status: 1,
      block_status: { $ne: 1 },
    });
    let rawCategories = activeDrivers
      .map((d) => d.cateogory)
      .filter((c) => c !== null && c !== undefined && c !== "");
    rawCategories = [...new Set(rawCategories)];

    const numericVehicleTypes = [];
    const objectIdCarTypes = [];
    for (const cat of rawCategories) {
      if (!isNaN(cat)) {
        numericVehicleTypes.push(Number(cat));
      } else if (mongoose.isValidObjectId(cat)) {
        objectIdCarTypes.push(cat);
      } else {
        const found = await CarType.findOne({
          typeName: new RegExp(`^${cat}$`, "i"),
        });
        if (found) {
          if (found.mysqlId) numericVehicleTypes.push(found.mysqlId);
          if (found._id) objectIdCarTypes.push(found._id);
        }
      }
    }

    const fareConditions = [];
    if (numericVehicleTypes.length > 0) {
      fareConditions.push({ vehicleType: { $in: numericVehicleTypes } });
    }
    if (objectIdCarTypes.length > 0) {
      fareConditions.push({ carType: { $in: objectIdCarTypes } });
    }

    let fareRates = [];
    if (fareConditions.length > 0) {
      fareRates = await PriceFare.find({ $or: fareConditions }).populate("carType");
    }
    if (!fareRates || fareRates.length === 0) {
      fareRates = await PriceFare.find().populate("carType");
    }

    const vehicleInfo = {
      1: {
        id: "1",
        name: "Minni",
        title: "Comfy, comfortable economical cars",
      },
      2: {
        id: "2",
        name: "Prime Sedan",
        title: "Spacious sedans, top drivers",
      },
      3: { id: "3", name: "Premium SUV", title: "Spacious SUVs" },
      4: {
        id: "4",
        name: "Premium Plus",
        title: "Ride at hourly packages",
      },
    };

    const currencySymbol = "₹";
    const fares = [];

    for (const fare of fareRates) {
      const vType = fare.vehicleType;
      const baseFarePerKm = parseFloat(fare.farePerKm) || 10;
      let originalPrice = Math.round(distance * baseFarePerKm);
      // Minimum fare fallback
      if (originalPrice <= 0) {
        originalPrice = vType === 1 ? 30 : vType === 2 ? 40 : 90;
      }
      const discountedPrice = Math.round(
        originalPrice - (discountPercentage / 100) * originalPrice
      );

      const info = vehicleInfo[vType] || {
        id: String(vType),
        name: fare.carType?.typeName || "Unknown",
        title: "Comfortable city ride",
      };

      fares.push({
        price: `${currencySymbol}${discountedPrice.toFixed(2)}`,
        old_price: `${currencySymbol}${originalPrice.toFixed(2)}`,
        vehicle_type: vType,
        name: info.name,
        title: info.title,
        image: formatImageUrl(fare.image, req),
      });
    }

    return res.status(200).json({
      message: "Address, Distance, and Fares Retrieved Successfully",
      details: {
        id: location._id ? String(location._id) : null,
        user_id: user._id ? String(user._id) : null,
        from_address: location.from_address || null,
        from_latitude: location.from_latitude || null,
        from_longitude: location.from_longitude || null,
        destination_address: location.destination_address || null,
        destination_latitude: location.destination_latitude || null,
        destination_longitude: location.destination_longitude || null,
        distance_in_kilometers: distance,
        coupon_id: location.coupon_id || null,
        cabDetails: fares,
      },
    });
  } catch (ex) {
    console.error("getVehicleTypePrice Error:", ex);
    return res.status(500).json({
      message: "Error",
      details: ex.message,
    });
  }
};

// 2.1 USE PROMO CODE (Equivalent to PHP: Route::any('use-promo-code', 'thirtyTwo'))
const usePromoCode = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Invalid Method" });
    }

    const token =
      req.headers.token ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({ message: "Token not provided" });
    }

    const user = await User.findOne({
      $or: [{ token: token }, { appToken: token }],
    });
    if (!user) {
      return res.status(404).json({ message: "Invalid user token" });
    }

    const location = await SendLocation.findOne({
      $or: [{ user_id: user._id }, { user_id: String(user._id) }],
    }).sort({ createdAt: -1, _id: -1 });

    if (!location) {
      return res.status(404).json({ error: "Location not found or inactive" });
    }

    const from_latitude = parseFloat(location.from_latitude);
    const from_longitude = parseFloat(location.from_longitude);
    const destination_latitude = parseFloat(location.destination_latitude);
    const destination_longitude = parseFloat(location.destination_longitude);
    const earthRadius = 6371000;

    let distance = 0;
    if (
      !isNaN(from_latitude) &&
      !isNaN(from_longitude) &&
      !isNaN(destination_latitude) &&
      !isNaN(destination_longitude)
    ) {
      const latFrom = (from_latitude * Math.PI) / 180;
      const lonFrom = (from_longitude * Math.PI) / 180;
      const latTo = (destination_latitude * Math.PI) / 180;
      const lonTo = (destination_longitude * Math.PI) / 180;

      const latDelta = latTo - latFrom;
      const lonDelta = lonTo - lonFrom;

      const a =
        Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
        Math.cos(latFrom) *
          Math.cos(latTo) *
          Math.sin(lonDelta / 2) *
          Math.sin(lonDelta / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceInMeters = earthRadius * c;
      const distanceInKilometers = distanceInMeters / 1000;
      distance = Math.round(distanceInKilometers * 100) / 100;
    }

    const vehicleType = req.body.vehicle_type || req.body.vehicleType || req.query.vehicle_type;
    const vTypeNum = !isNaN(Number(vehicleType)) ? Number(vehicleType) : null;
    const fareRateQuery = {
      $or: [
        ...(vTypeNum !== null ? [{ vehicleType: vTypeNum }, { vehicle_type: vTypeNum }] : []),
        { vehicleType: vehicleType },
        { vehicle_type: vehicleType },
      ],
    };
    if (vehicleType && mongoose.isValidObjectId(vehicleType)) {
      fareRateQuery.$or.push({ carType: vehicleType });
    }

    const fare_rates = await PriceFare.find(fareRateQuery).populate("carType");
    if (!fare_rates || fare_rates.length === 0) {
      return res.status(404).json({
        message: "Fare rates not found for the selected vehicle type",
      });
    }

    const vehicleInfo = {
      1: { name: "Minni", title: "Comfy, comfortable economical cars" },
      2: { name: "Prime Sedan", title: "Spacious sedans, top drivers" },
      3: { name: "Premium SUV", title: "Spacious SUVs" },
      4: { name: "Premium Plus", title: "Ride at hourly packages" },
    };

    const fares = [];
    for (const fare of fare_rates) {
      const vType = fare.vehicleType || fare.vehicle_type;
      const vehicleInfoForType = vehicleInfo[vType] || {
        name: fare.carType?.typeName || "Unknown Vehicle",
        title: "Unknown",
      };
      const farePerKm = parseFloat(fare.farePerKm || fare.fare_per_km) || 0;
      fares.push({
        price: Math.round(distance * farePerKm * 100) / 100,
        name: vehicleInfoForType.name,
        title: vehicleInfoForType.title,
      });
    }

    const promoCode = req.body.promo_code || req.body.code || req.query.promo_code;
    let discountPercentage = 0;
    let matchedPromo = null;

    if (promoCode) {
      const codeStr = String(promoCode).trim();
      const todayStr = new Date().toISOString().split("T")[0];
      const promo = await Promo.findOne({
        $or: [
          { code: new RegExp(`^${codeStr}$`, "i") },
          { promo_code: new RegExp(`^${codeStr}$`, "i") },
        ],
        status: { $nin: ["Inactive", "0"] },
      });

      if (promo) {
        const isStarted =
          !promo.startDate ||
          promo.startDate <= todayStr ||
          new Date(promo.startDate) <= new Date();
        const isNotExpired =
          !promo.endDate ||
          promo.endDate >= todayStr ||
          new Date(promo.endDate) >= new Date();

        if (isStarted && isNotExpired) {
          discountPercentage = Number(promo.discount) || 0;
          matchedPromo = promo;
        }
      }
    }

    if (discountPercentage > 0) {
      for (let index = 0; index < fares.length; index++) {
        fares[index].price =
          Math.round(
            (fares[index].price - (fares[index].price * discountPercentage) / 100) * 100
          ) / 100;
      }
    }

    location.distance_in_kilometers = distance;
    location.fares = fares;
    if (matchedPromo) {
      location.coupon_id = matchedPromo._id;
    }
    await location.save();

    return res.status(200).json({
      message:
        discountPercentage > 0
          ? "Fare Calculation with Promo Code Applied"
          : "Fare Calculation without Promo Code",
      details: fares,
    });
  } catch (ex) {
    console.error("usePromoCode Error:", ex);
    return res.status(500).json({
      message: "Error occurred during fare calculation",
      details: ex.message,
    });
  }
};

// 3. GET AVAILABLE NEARBY DRIVERS (Haversine 20 KM Radius)
// Equivalent to PHP: Route::any('get-available-drivers', 'get_available_drivers')
const getAvailableDrivers = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const user = await User.findOne({ $or: [{ appToken: token }, { token: token }] });
    if (!user) {
      return res.status(404).json({
        message: "Invalid user token",
      });
    }

    const body = req.body || {};
    const fromLat = body.fromLat || req?.query?.fromLat;
    const fromLng = body.fromLng || req?.query?.fromLng;
    const vehicle_id = body.vehicle_id || req?.query?.vehicle_id;
    const userLat = parseFloat(fromLat);
    const userLng = parseFloat(fromLng);
    const radiusKm = 20;

    const query = {
      active_status: 1,
      block_status: { $ne: 1 },
      latitude: { $ne: null },
      longitude: { $ne: null },
    };

    if (vehicle_id) {
      // Resolve CarType if vehicle_id is numeric or ObjectId or typeName
      const carTypeConditions = [];
      if (!isNaN(vehicle_id)) carTypeConditions.push({ mysqlId: Number(vehicle_id) });
      if (mongoose.Types.ObjectId.isValid(vehicle_id)) carTypeConditions.push({ _id: vehicle_id });
      carTypeConditions.push({ typeName: new RegExp(`^${vehicle_id}$`, "i") });

      const carType = await CarType.findOne({ $or: carTypeConditions });

      const categoryMatches = [vehicle_id, String(vehicle_id)];
      if (carType) {
        if (carType.mysqlId) categoryMatches.push(carType.mysqlId, String(carType.mysqlId));
        if (carType._id) categoryMatches.push(carType._id, String(carType._id));
        if (carType.typeName) categoryMatches.push(carType.typeName);
      }

      query.cateogory = { $in: [...new Set(categoryMatches)] };
    }

    const drivers = await Driver.find(query);

    // Get topup requirements mapping
    const topups = await DriverTopup.find();
    const topupMap = {};
    topups.forEach((t) => {
      const topupAmt = t.topupAmount ?? t.topup_amount ?? 0;
      if (t.carTypeId) topupMap[String(t.carTypeId)] = topupAmt;
      if (t.car_type_id) topupMap[String(t.car_type_id)] = topupAmt;
      if (t.carType) topupMap[String(t.carType)] = topupAmt;
    });

    // Also map CarType names and ObjectIds to topupAmount
    const allCarTypes = await CarType.find();
    allCarTypes.forEach((ct) => {
      const reqAmount = topupMap[String(ct.mysqlId)] ?? topupMap[String(ct._id)] ?? 0;
      topupMap[ct.typeName] = reqAmount;
      topupMap[String(ct._id)] = reqAmount;
      if (ct.mysqlId) topupMap[String(ct.mysqlId)] = reqAmount;
    });

    const nearbyDrivers = [];

    for (const d of drivers) {
      const dLat = parseFloat(d.latitude);
      const dLng = parseFloat(d.longitude);
      if (isNaN(dLat) || isNaN(dLng)) continue;

      // Minimum wallet requirement
      const requiredWallet = topupMap[String(d.cateogory)] ?? 0;
      if ((d.wallet || 0) < requiredWallet) continue;

      // Spherical law of cosines / Haversine formula matching PHP DB::raw
      const R = 6371; // Earth radius in KM
      const dLatRad = ((dLat - userLat) * Math.PI) / 180;
      const dLngRad = ((dLng - userLng) * Math.PI) / 180;
      const a =
        Math.sin(dLatRad / 2) * Math.sin(dLatRad / 2) +
        Math.cos((userLat * Math.PI) / 180) *
          Math.cos((dLat * Math.PI) / 180) *
          Math.sin(dLngRad / 2) *
          Math.sin(dLngRad / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(R * c * 100) / 100;

      if (distance <= radiusKm) {
        let driverImage = formatImageUrl(d.image);
        if (!driverImage || driverImage.endsWith("/uploads/null") || driverImage.endsWith("/uploads/undefined")) {
          driverImage = "http://localhost:5000/images/dummy-driver.png";
        }

        nearbyDrivers.push({
          id: d.mysqlId || d._id,
          driver_mongo_id: d._id,
          name: d.name ? `${d.name} ${d.last_name || ""}`.trim() : "Driver",
          image: driverImage,
          latitude: d.latitude,
          longitude: d.longitude,
          wallet: d.wallet,
          distance: distance,
        });
      }
    }

    // Sort nearest first
    nearbyDrivers.sort((a, b) => a.distance - b.distance);

    return res.status(200).json({
      success: true,
      message: "Nearby drivers fetched successfully",
      total_drivers: nearbyDrivers.length,
      data: nearbyDrivers,
    });
  } catch (error) {
    console.error("Error in getAvailableDrivers:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 4. USER BOOK RIDE (In-City)
// Equivalent to PHP: Route::any('user-book-ride', 'user_book_ride')
const userBookRide = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const user = await User.findOne({ $or: [{ appToken: token }, { token: token }] });
  if (!user) {
    return res.status(404).json({ message: "Invalid user token" });
  }

  // Account verification check (register == 0 and isRegistered === false)
  if (user.register === 0 && !user.isRegistered) {
    return res.status(404).json({
      message: "Your account is not verified, Please contact Customer Care for more details",
    });
  }

  const body = req.body || {};
  const driver_id = body.driver_id || req?.query?.driver_id;
  const vehicle_id = body.vehicle_id || req?.query?.vehicle_id;
  const from = body.from || req?.query?.from;
  const fromLat = body.fromLat || req?.query?.fromLat;
  const fromLng = body.fromLng || req?.query?.fromLng;
  const to = body.to || req?.query?.to;
  const toLat = body.toLat || req?.query?.toLat;
  const toLng = body.toLng || req?.query?.toLng;
  const totalFare = body.totalFare || req?.query?.totalFare;
  const distance = body.distance || req?.query?.distance;

  if (
    !driver_id ||
    !vehicle_id ||
    !from ||
    fromLat === undefined ||
    fromLng === undefined ||
    !to ||
    toLat === undefined ||
    toLng === undefined ||
    totalFare === undefined ||
    distance === undefined
  ) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        driver_id: !driver_id ? ["The driver_id field is required."] : undefined,
        vehicle_id: !vehicle_id ? ["The vehicle_id field is required."] : undefined,
        from: !from ? ["The from field is required."] : undefined,
        fromLat: fromLat === undefined ? ["The fromLat field is required."] : undefined,
        fromLng: fromLng === undefined ? ["The fromLng field is required."] : undefined,
        to: !to ? ["The to field is required."] : undefined,
        toLat: toLat === undefined ? ["The toLat field is required."] : undefined,
        toLng: toLng === undefined ? ["The toLng field is required."] : undefined,
        totalFare: totalFare === undefined ? ["The totalFare field is required."] : undefined,
        distance: distance === undefined ? ["The distance field is required."] : undefined,
      },
    });
  }

  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Ride.create({
      user_id: user._id,
      driver_id: mongoose.isValidObjectId(driver_id) ? new mongoose.Types.ObjectId(driver_id) : driver_id,
      vehicle_id: mongoose.isValidObjectId(vehicle_id) ? new mongoose.Types.ObjectId(vehicle_id) : vehicle_id,
      from,
      from_lat: String(fromLat),
      from_lng: String(fromLng),
      to,
      to_lat: String(toLat),
      to_lng: String(toLng),
      rideFare: parseFloat(totalFare) || 0,
      totalFare: String(totalFare),
      distance: String(distance),
      otp,
      status: "booked",
      booking_type: "inCity",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Send SMS via DLT Gateway
    const userPhone = user.phone || user.number || "";
    const cleanNumber = userPhone.replace(/[^0-9]/g, "").slice(-10);
    if (cleanNumber.length === 10) {
      try {
        const message = `Your Bhrosa Cabs Ride Start OTP is ${otp}. Please share this OTP with your driver to begin your ride. Do not share this OTP with anyone else. It is valid for a limited time. Thanks, Bhrosa Group`;
        const url = new URL("https://msg.vadvertiseweb.com/submitsms.jsp");
        url.searchParams.append("user", "Bhrosa");
        url.searchParams.append("key", process.env.SMS_API_KEY || "880050d0b4XX");
        url.searchParams.append("mobile", cleanNumber);
        url.searchParams.append("message", message);
        url.searchParams.append("senderid", "BHRGRP");
        url.searchParams.append("accusage", "1");
        url.searchParams.append("entityid", "1701176768268781357");
        url.searchParams.append("tempid", "1707177755350501043");

        await fetch(url.toString(), { method: "GET", signal: AbortSignal.timeout(15000) });
      } catch (smsErr) {
        console.warn("SMS Gateway warning in userBookRide:", smsErr.message);
      }
    }

    return res.status(200).json({
      status: true,
      message: "Ride booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Ride Booking Error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 5. DRIVER ARRIVED AT PICKUP
// Equivalent to PHP: Route::any('user-book-ride-arrived', 'user_book_ride_arrived')
const userBookRideArrived = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid Driver token" });
  }

  const body = req.body || {};
  const booking_id = body.booking_id || req?.query?.booking_id;

  if (!booking_id) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        booking_id: ["The booking_id field is required."],
      },
    });
  }

  try {
    const bookingQuery = [];
    if (mongoose.isValidObjectId(booking_id)) {
      bookingQuery.push({ _id: new mongoose.Types.ObjectId(booking_id) });
    }
    bookingQuery.push({ _id: booking_id });
    if (!isNaN(booking_id)) {
      bookingQuery.push({ mysqlId: Number(booking_id) });
    }

    const driverMatches = [driver._id, String(driver._id)];
    if (driver.mysqlId) {
      driverMatches.push(driver.mysqlId, String(driver.mysqlId));
    }

    const booking = await Ride.findOne({
      $or: bookingQuery,
      driver_id: { $in: driverMatches },
      status: "booked",
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid booking ID or OTP" });
    }

    const receiveOtp = Math.floor(1000 + Math.random() * 9000).toString();

    booking.status = "arrived";
    booking.otp = receiveOtp;
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "Ride arrived successfully",
    });
  } catch (e) {
    console.error("Ride Arrived Error:", e.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: e.message,
    });
  }
};

// 6. DRIVER START RIDE (Verify OTP)
// Equivalent to PHP: Route::any('user-ride-start', 'user_ride_start')
const userRideStart = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid Driver token" });
  }

  const body = req.body || {};
  const booking_id = body.booking_id || req?.query?.booking_id;
  const otp = body.otp || req?.query?.otp;
  const waitingMinutes = body.waitingMinutes || req?.query?.waitingMinutes || 0;
  const waitingCharge = body.waitingCharge || req?.query?.waitingCharge || 0;

  if (!booking_id || !otp) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        booking_id: !booking_id ? ["The booking_id field is required."] : undefined,
        otp: !otp ? ["The otp field is required."] : undefined,
      },
    });
  }

  try {
    const bookingQuery = [];
    if (mongoose.isValidObjectId(booking_id)) {
      bookingQuery.push({ _id: new mongoose.Types.ObjectId(booking_id) });
    }
    bookingQuery.push({ _id: booking_id });
    if (!isNaN(booking_id)) {
      bookingQuery.push({ mysqlId: Number(booking_id) });
    }

    const driverMatches = [driver._id, String(driver._id)];
    if (driver.mysqlId) {
      driverMatches.push(driver.mysqlId, String(driver.mysqlId));
    }

    const booking = await Ride.findOne({
      $or: bookingQuery,
      driver_id: { $in: driverMatches },
      otp: String(otp),
      status: { $in: ["booked", "arrived"] },
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid booking ID or OTP" });
    }

    const userConditions = [];
    if (mongoose.isValidObjectId(booking.user_id)) {
      userConditions.push({ _id: new mongoose.Types.ObjectId(booking.user_id) });
    }
    userConditions.push({ _id: booking.user_id });
    if (!isNaN(booking.user_id)) {
      userConditions.push({ mysqlId: Number(booking.user_id) });
    }

    const userOtp = await User.findOne({ $or: userConditions });


    const receiveOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const wMins = parseInt(waitingMinutes) || 0;
    const wCharge = parseFloat(waitingCharge) || 0;

    booking.status = "in_progress";
    booking.otp = receiveOtp;
    booking.waitingMinutes = wMins;
    booking.waitingCharge = wCharge;
    booking.totalFare = String((parseFloat(booking.totalFare) || 0) + wCharge);
    booking.updated_at = new Date();
    await booking.save();

    // Send SMS via DLT Gateway to Passenger
    if (userOtp) {
      const userPhone = userOtp.phone || userOtp.number || "";
      const cleanNumber = userPhone.replace(/[^0-9]/g, "").slice(-10);
      if (cleanNumber.length === 10) {
        try {
          const message = `Your Bhrosa Cabs Ride Completion OTP is ${receiveOtp}. Please share this OTP with your driver to complete your ride. Do not share this OTP with anyone else. It is valid for a limited time. Thanks, Bhrosa Group`;
          const url = new URL("https://msg.vadvertiseweb.com/submitsms.jsp");
          url.searchParams.append("user", "Bhrosa");
          url.searchParams.append("key", process.env.SMS_API_KEY || "880050d0b4XX");
          url.searchParams.append("mobile", cleanNumber);
          url.searchParams.append("message", message);
          url.searchParams.append("senderid", "BHRGRP");
          url.searchParams.append("accusage", "1");
          url.searchParams.append("entityid", "1701176768268781357");
          url.searchParams.append("tempid", "1707177755355775338");

          await fetch(url.toString(), { method: "GET", signal: AbortSignal.timeout(15000) });
        } catch (smsErr) {
          console.warn("SMS Gateway warning in userRideStart:", smsErr.message);
        }
      }
    }

    return res.status(200).json({
      status: true,
      message: "Ride started successfully",
      data: {
        booking_id: booking.mysqlId || booking._id,
        booking_mongo_id: booking._id,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Ride Start Error:", error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 7. DRIVER COMPLETE RIDE (Auto Commission Settlement)
// Equivalent to PHP: Route::any('user-ride-complete', 'user_ride_complete')
const userRideComplete = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid Driver token" });
  }

  const body = req.body || {};
  const booking_id = body.booking_id || req?.query?.booking_id;
  const otp = body.otp || req?.query?.otp;

  if (!booking_id || !otp) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        booking_id: !booking_id ? ["The booking_id field is required."] : undefined,
        otp: !otp ? ["The otp field is required."] : undefined,
      },
    });
  }

  try {
    const bookingQuery = [];
    if (mongoose.isValidObjectId(booking_id)) {
      bookingQuery.push({ _id: new mongoose.Types.ObjectId(booking_id) });
    }
    bookingQuery.push({ _id: booking_id });
    if (!isNaN(booking_id)) {
      bookingQuery.push({ mysqlId: Number(booking_id) });
    }

    const driverMatches = [driver._id, String(driver._id)];
    if (driver.mysqlId) {
      driverMatches.push(driver.mysqlId, String(driver.mysqlId));
    }

    const booking = await Ride.findOne({
      $or: bookingQuery,
      driver_id: { $in: driverMatches },
      otp: String(otp),
      status: { $in: ["in_progress", "ongoing"] },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Invalid booking ID, OTP, or ride status",
      });
    }

    // 1. Mark ride as completed
    booking.otp = null;
    booking.status = "completed";
    booking.updated_at = new Date();
    await booking.save();

    // 2. Resolve Driver Topup configuration
    // Driver category can be mysqlId, ObjectId, or typeName (e.g. 'Sedan')
    const carTypeConditions = [];
    if (!isNaN(driver.cateogory)) carTypeConditions.push({ mysqlId: Number(driver.cateogory) });
    if (mongoose.Types.ObjectId.isValid(driver.cateogory)) carTypeConditions.push({ _id: driver.cateogory });
    carTypeConditions.push({ typeName: new RegExp(`^${driver.cateogory}$`, "i") });

    const carType = await CarType.findOne({ $or: carTypeConditions });

    const topupMatches = [];
    if (driver.cateogory && !isNaN(driver.cateogory)) {
      topupMatches.push({ carTypeId: Number(driver.cateogory) });
    }
    if (carType) {
      if (carType.mysqlId && !isNaN(carType.mysqlId)) {
        topupMatches.push({ carTypeId: Number(carType.mysqlId) });
      }
      if (carType._id) {
        topupMatches.push({ carType: carType._id });
      }
    }

    const driverTopup = topupMatches.length > 0 ? await DriverTopup.findOne({ $or: topupMatches }) : null;

    if (driverTopup) {
      const bFare = parseFloat(booking.totalFare) || 0;
      const bDist = parseFloat(booking.distance) || 0;

      const slabs = driverTopup.slabs;
      const aboveDistance = driverTopup.aboveDistance ?? driverTopup.above_distance;
      const extraCharge = driverTopup.extraCharge ?? driverTopup.extra_charge;
      const topupAmount = parseFloat(driverTopup.topupAmount ?? driverTopup.topup_amount) || 0;

      // Rule A: ONLY EXTRA CHARGE TYPE
      if (slabs == null && aboveDistance == null && extraCharge != null) {
        const ecRate = parseFloat(extraCharge) || 0;
        const extraCommission = Math.round(((bFare / 100) * ecRate) * 100) / 100;

        driver.wallet = (parseFloat(driver.wallet) || 0) - extraCommission;
        await driver.save();

        booking.extraChargeParcent = ecRate;
        booking.extraChargeAmount = extraCommission;
        await booking.save();

        await DriverWalletRecharge.create({
          driver_id: driver._id,
          amount: `-${extraCommission}`,
          status: "1",
          transaction_id: "Extra charge deduction",
          booking_id: booking._id,
        });
      }

      // Rule B: ABOVE DISTANCE CHARGE
      if (aboveDistance && extraCharge && bDist >= parseFloat(aboveDistance)) {
        const ecRate = parseFloat(extraCharge) || 0;
        const extraCommission = Math.round(((bFare / 100) * ecRate) * 100) / 100;

        driver.wallet = (parseFloat(driver.wallet) || 0) - extraCommission;
        await driver.save();

        booking.aboveDistanceKm = parseFloat(aboveDistance);
        booking.aboveDistancePrice = extraCommission;
        booking.aboveDistanceParcent = ecRate;
        await booking.save();

        await DriverWalletRecharge.create({
          driver_id: driver._id,
          amount: `-${extraCommission}`,
          status: "1",
          transaction_id: "Above distance charges deduction",
          booking_id: booking._id,
        });
      }

      // Rule C: SLAB COMMISSION
      if (slabs != null) {
        const unpaidRides = await Ride.find({
          driver_id: { $in: driverMatches },
          commission_status: 0,
        });

        const sumUnpaid = unpaidRides.reduce((acc, r) => acc + (parseFloat(r.totalFare) || 0), 0);

        if (sumUnpaid >= parseFloat(slabs)) {
          driver.wallet = (parseFloat(driver.wallet) || 0) - topupAmount;
          await driver.save();

          await Ride.updateMany(
            { driver_id: { $in: driverMatches }, commission_status: 0 },
            { $set: { commission_status: 1 } }
          );

          await DriverWalletRecharge.create({
            driver_id: driver._id,
            amount: `-${topupAmount}`,
            status: "1",
            transaction_id: "Slabs deduction",
            booking_id: booking._id,
          });
        }
      }
    }

    return res.status(200).json({
      status: true,
      message: "Ride completed successfully",
      data: {
        booking_id: booking.mysqlId || booking._id,
        booking_mongo_id: booking._id,
        status: booking.status,
        wallet: driver.wallet,
      },
    });
  } catch (e) {
    console.error("Ride Complete Error : ", e.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: e.message,
    });
  }
};

// 8. USER CANCEL RIDE (Compensate Driver +₹50)
// Equivalent to PHP: Route::any('user-ride-cancel', 'user_ride_cancel')
const userRideCancel = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const user = await User.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!user) {
    return res.status(404).json({ message: "Invalid User token" });
  }

  const body = req.body || {};
  const booking_id = body.booking_id || req?.query?.booking_id;
  const reason = body.reason || req?.query?.reason;

  if (!booking_id) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        booking_id: ["The booking_id field is required."],
      },
    });
  }

  try {
    const bookingQuery = [];
    if (mongoose.isValidObjectId(booking_id)) {
      bookingQuery.push({ _id: new mongoose.Types.ObjectId(booking_id) });
    }
    bookingQuery.push({ _id: booking_id });
    if (!isNaN(booking_id)) {
      bookingQuery.push({ mysqlId: Number(booking_id) });
    }

    const userMatches = [user._id, String(user._id)];
    if (user.mysqlId) {
      userMatches.push(user.mysqlId, String(user.mysqlId));
    }

    const booking = await Ride.findOne({
      $or: bookingQuery,
      user_id: { $in: userMatches },
      status: "booked",
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or ride cannot be cancelled",
      });
    }

    const cancelReason = reason || "No reason provided";
    const fullReason = `User ${user.name || "Customer"}: ${cancelReason}`;

    booking.status = "cancelled";
    booking.reson = fullReason;
    booking.otp = null;
    booking.updated_at = new Date();
    await booking.save();

    // Create cancel fine entry (90 rs)
    await UserRideCancel.create({
      user_booking_id: booking._id,
      fine: 90,
    });

    // Driver compensation (+₹50 to driver wallet)
    if (booking.driver_id) {
      const driverConditions = [];
      if (mongoose.isValidObjectId(booking.driver_id)) {
        driverConditions.push({ _id: new mongoose.Types.ObjectId(booking.driver_id) });
      }
      driverConditions.push({ _id: booking.driver_id });
      if (!isNaN(booking.driver_id)) {
        driverConditions.push({ mysqlId: Number(booking.driver_id) });
      }

      const driver = await Driver.findOne({ $or: driverConditions });
      if (driver) {
        driver.wallet = (parseFloat(driver.wallet) || 0) + 50;
        await driver.save();

        const bookingIdentifier = booking.mysqlId || booking._id;
        const userIdentifier = user.mysqlId || user._id;

        await DriverWalletRecharge.create({
          driver_id: driver._id,
          amount: "+50",
          status: "1",
          transaction_id: `Booking ID: ${bookingIdentifier}, User ID: ${userIdentifier} - Ride Cancel Charge (Cancel by User)`,
          booking_id: booking._id,
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Ride cancelled successfully",
      data: {
        booking_id: booking.mysqlId || booking._id,
        booking_mongo_id: booking._id,
        status: booking.status,
        reason: booking.reson,
      },
    });
  } catch (error) {
    console.error("Ride Cancel Error: ", error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 9. DRIVER CANCEL RIDE (Penalty -₹50)
// Equivalent to PHP: Route::any('driver-ride-cancel', 'driver_ride_cancel')
const driverRideCancel = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid Driver token" });
  }

  const body = req.body || {};
  const booking_id = body.booking_id || req?.query?.booking_id;
  const reason = body.reason || req?.query?.reason;

  if (!booking_id) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        booking_id: ["The booking_id field is required."],
      },
    });
  }

  try {
    const bookingQuery = [];
    if (mongoose.isValidObjectId(booking_id)) {
      bookingQuery.push({ _id: new mongoose.Types.ObjectId(booking_id) });
    }
    bookingQuery.push({ _id: booking_id });
    if (!isNaN(booking_id)) {
      bookingQuery.push({ mysqlId: Number(booking_id) });
    }

    const driverMatches = [driver._id, String(driver._id)];
    if (driver.mysqlId) {
      driverMatches.push(driver.mysqlId, String(driver.mysqlId));
    }

    const booking = await Ride.findOne({
      $or: bookingQuery,
      driver_id: { $in: driverMatches },
      status: "booked",
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found or ride cannot be cancelled",
      });
    }

    const cancelReason = reason || "No reason provided";
    const fullReason = `Driver ${driver.name || "Driver"}: ${cancelReason}`;

    booking.status = "cancelled";
    booking.reson = fullReason;
    booking.otp = null;
    booking.updated_at = new Date();
    await booking.save();

    // Deduct ₹50 penalty from driver wallet
    driver.wallet = (parseFloat(driver.wallet) || 0) - 50;
    await driver.save();

    const bookingIdentifier = booking.mysqlId || booking._id;

    await DriverWalletRecharge.create({
      driver_id: driver._id,
      amount: "-50",
      status: "1",
      transaction_id: `Booking ID ${bookingIdentifier} - Driver Ride Cancel Charge (Cancel By Driver)`,
      booking_id: booking._id,
    });

    return res.status(200).json({
      status: true,
      message: "Ride cancelled successfully",
      data: {
        booking_id: booking.mysqlId || booking._id,
        booking_mongo_id: booking._id,
        status: booking.status,
        reason: booking.reson,
      },
    });
  } catch (error) {
    console.error("Driver Ride Cancel Error: ", error.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 10. DRIVER RIDE HISTORY & EARNINGS
// Equivalent to PHP: Route::any('driver-ride-history', 'driver_ride_history')
const driverRideHistory = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(404).json({ message: "Invalid Driver token" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid Driver token" });
  }

  try {
    const driverMatches = [driver._id, String(driver._id)];
    if (driver.mysqlId) {
      driverMatches.push(driver.mysqlId, String(driver.mysqlId));
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Earnings aggregation for completed rides
    const earnings = await Ride.aggregate([
      {
        $match: {
          driver_id: { $in: driverMatches },
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          today: {
            $sum: { $cond: [{ $gte: ["$created_at", startOfToday] }, { $toDouble: "$totalFare" }, 0] },
          },
          this_week: {
            $sum: { $cond: [{ $gte: ["$created_at", startOfWeek] }, { $toDouble: "$totalFare" }, 0] },
          },
          this_month: {
            $sum: { $cond: [{ $gte: ["$created_at", startOfMonth] }, { $toDouble: "$totalFare" }, 0] },
          },
          this_year: {
            $sum: { $cond: [{ $gte: ["$created_at", startOfYear] }, { $toDouble: "$totalFare" }, 0] },
          },
        },
      },
    ]);

    const earningSummary = earnings[0]
      ? {
          today: earnings[0].today || 0,
          this_week: earnings[0].this_week || 0,
          this_month: earnings[0].this_month || 0,
          this_year: earnings[0].this_year || 0,
        }
      : { today: 0, this_week: 0, this_month: 0, this_year: 0 };

    const bookings = await Ride.find({
      driver_id: { $in: driverMatches },
    })
      .populate("user_id", "name number phone image")
      .sort({ created_at: -1, _id: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No ride history found",
        earning: earningSummary,
        data: [],
      });
    }

    const bookingIds = bookings.map((b) => b._id);
    const bookingMysqlIds = bookings.map((b) => b.mysqlId).filter(Boolean);

    const walletRecharges = await DriverWalletRecharge.find({
      booking_id: { $in: [...bookingIds, ...bookingMysqlIds] },
    });

    const rechargeMap = {};
    walletRecharges.forEach((r) => {
      rechargeMap[String(r.booking_id)] = r;
    });

    const formattedBookings = bookings.map((b) => {
      const bKey = String(b.mysqlId || b._id);
      const bKeyMongo = String(b._id);
      const walletRecharge = rechargeMap[bKey] || rechargeMap[bKeyMongo] || null;

      return {
        id: b.mysqlId || b._id,
        booking_mongo_id: b._id,
        from: b.from,
        from_lat: b.from_lat,
        from_lng: b.from_lng,
        to: b.to,
        to_lat: b.to_lat,
        to_lng: b.to_lng,
        waitingMinutes: b.waitingMinutes,
        waitingCharge: b.waitingCharge,
        distance: b.distance,
        rideFare: b.rideFare,
        totalFare: b.totalFare,
        extraChargeParcent: b.extraChargeParcent,
        extraChargeAmount: b.extraChargeAmount,
        aboveDistanceKm: b.aboveDistanceKm,
        aboveDistancePrice: b.aboveDistancePrice,
        aboveDistanceParcent: b.aboveDistanceParcent,
        user_name: b.user_id?.name || null,
        user_phone: b.user_id?.number || b.user_id?.phone || null,
        user_image: b.user_id?.image ? formatImageUrl(b.user_id.image) : null,
        status: b.status,
        is_cancelled_ride: walletRecharge ? true : false,
        cancel_message: walletRecharge ? "You cancelled this ride." : null,
        recharge_amount: walletRecharge ? walletRecharge.amount : null,
        transaction_id: walletRecharge ? walletRecharge.transaction_id : null,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Driver ride history",
      earning: earningSummary,
      data: formattedBookings,
    });
  } catch (error) {
    console.error("Error in driverRideHistory:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 11. USER RIDE HISTORY
// Equivalent to PHP: Route::any('user-ride-history', 'user_ride_history')
const userRideHistory = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(404).json({ message: "Invalid user token" });
  }

  const user = await User.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!user) {
    return res.status(404).json({ message: "Invalid user token" });
  }

  try {
    const userMatches = [user._id, String(user._id)];
    if (user.mysqlId) {
      userMatches.push(user.mysqlId, String(user.mysqlId));
    }

    const bookings = await Ride.find({
      user_id: { $in: userMatches },
    })
      .populate("driver_id", "name last_name number image")
      .sort({ created_at: -1, _id: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No ride history found",
        data: [],
      });
    }

    const bookingIds = bookings.map((b) => b._id);
    const bookingMysqlIds = bookings.map((b) => b.mysqlId).filter(Boolean);

    const cancelRides = await UserRideCancel.find({
      user_booking_id: { $in: [...bookingIds, ...bookingMysqlIds] },
    });

    const cancelMap = {};
    cancelRides.forEach((c) => {
      cancelMap[String(c.user_booking_id)] = c;
    });

    const formattedBookings = bookings.map((b) => {
      const bKey = String(b.mysqlId || b._id);
      const bKeyMongo = String(b._id);
      const cancelData = cancelMap[bKey] || cancelMap[bKeyMongo] || null;

      let driverFullName = null;
      if (b.driver_id) {
        driverFullName = `${b.driver_id.name || ""} ${b.driver_id.last_name || ""}`.trim() || null;
      }

      return {
        id: b.mysqlId || b._id,
        booking_mongo_id: b._id,
        from: b.from,
        from_lat: b.from_lat,
        from_lng: b.from_lng,
        to: b.to,
        to_lat: b.to_lat,
        to_lng: b.to_lng,
        waitingMinutes: b.waitingMinutes,
        waitingCharge: b.waitingCharge,
        distance: b.distance,
        rideFare: b.rideFare,
        totalFare: b.totalFare,
        driver_name: driverFullName,
        driver_phone: b.driver_id?.number || null,
        driver_image: b.driver_id?.image ? formatImageUrl(b.driver_id.image) : null,
        status: b.status,

        // Cancel Ride Details
        is_cancelled_by_user: cancelData ? true : false,
        cancel_message: cancelData ? "This ride was canceled by you." : null,
        cancel_fine: cancelData ? cancelData.fine : null,
      };
    });

    return res.status(200).json({
      status: true,
      message: "User ride history",
      data: formattedBookings,
    });
  } catch (error) {
    console.error("Error in userRideHistory:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

/* =========================================================================
   OUTSTATION RIDES LIFECYCLE
   ========================================================================= */

// 12. USER BOOK OUTSTATION RIDE
// Equivalent to PHP: Route::any('user-book-outStation', 'user_book_outStation')
const userBookOutStation = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.header("token") || req.header("authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const user = await User.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!user) {
    return res.status(404).json({ message: "Invalid user token" });
  }

  // Verification check matching PHP: if ($user->register == 0)
  if (user.register === 0 || user.isRegistered === false) {
    return res.status(404).json({
      message: "Your account is not verified, Please contact Customer Care for more details",
    });
  }

  const body = req.body || {};
  const driver_id = body.driver_id || req?.query?.driver_id;
  const vehicle_id = body.vehicle_id || req?.query?.vehicle_id;
  const from = body.from || req?.query?.from;
  const fromLat = body.fromLat || req?.query?.fromLat;
  const fromLng = body.fromLng || req?.query?.fromLng;
  const to = body.to || req?.query?.to;
  const toLat = body.toLat || req?.query?.toLat;
  const toLng = body.toLng || req?.query?.toLng;
  const totalFare = body.totalFare || req?.query?.totalFare;
  const distance = body.distance || req?.query?.distance;
  const date = body.date || req?.query?.date || null;
  const time = body.time || req?.query?.time || null;

  if (
    !driver_id ||
    !vehicle_id ||
    !from ||
    fromLat === undefined ||
    fromLng === undefined ||
    !to ||
    toLat === undefined ||
    toLng === undefined ||
    totalFare === undefined ||
    distance === undefined
  ) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        driver_id: !driver_id ? ["The driver_id field is required."] : undefined,
        vehicle_id: !vehicle_id ? ["The vehicle_id field is required."] : undefined,
        from: !from ? ["The from field is required."] : undefined,
        fromLat: fromLat === undefined ? ["The fromLat field is required."] : undefined,
        fromLng: fromLng === undefined ? ["The fromLng field is required."] : undefined,
        to: !to ? ["The to field is required."] : undefined,
        toLat: toLat === undefined ? ["The toLat field is required."] : undefined,
        toLng: toLng === undefined ? ["The toLng field is required."] : undefined,
        totalFare: totalFare === undefined ? ["The totalFare field is required."] : undefined,
        distance: distance === undefined ? ["The distance field is required."] : undefined,
      },
    });
  }

  try {
    // Lookup outstation above km rule from PriceFare
    const fareConditions = [];
    if (!isNaN(vehicle_id)) {
      fareConditions.push({ vehicleType: Number(vehicle_id) });
    }
    if (mongoose.isValidObjectId(vehicle_id)) {
      fareConditions.push({ carType: new mongoose.Types.ObjectId(vehicle_id) });
    }

    const getOut = fareConditions.length > 0 ? await PriceFare.findOne({ $or: fareConditions }) : null;
    const outStationADkm = getOut?.outStationAboveKm || null;

    const data = {
      user_id: user._id,
      driver_id: mongoose.isValidObjectId(driver_id) ? new mongoose.Types.ObjectId(driver_id) : driver_id,
      vehicle_id: mongoose.isValidObjectId(vehicle_id) ? new mongoose.Types.ObjectId(vehicle_id) : vehicle_id,
      from,
      from_lat: String(fromLat),
      from_lng: String(fromLng),
      to,
      to_lat: String(toLat),
      to_lng: String(toLng),
      rideFare: parseFloat(totalFare) || 0,
      totalFare: String(totalFare),
      booking_type: "outStation",
      date,
      time,
      outStationADkm,
      outStationADparcent: 12,
      distance: String(distance),
      status: "booked",
      created_at: new Date(),
      updated_at: new Date(),
    };

    const booking = await Ride.create(data);

    return res.status(200).json({
      status: true,
      message: "Ride booked successfully",
      booking,
    });
  } catch (e) {
    console.error("Ride Booking Error: " + e.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: e.message,
    });
  }
};

// 13. DRIVER START OUTSTATION
const driverStartOutStation = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid driver token" });
  }

  const { booking_id } = req.body;
  if (!booking_id) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        booking_id: ["The booking_id field is required."],
      },
    });
  }

  const driverIds = [driver._id];
  if (driver.mysqlId) driverIds.push(driver.mysqlId);
  if (driver.id && typeof driver.id === "number") driverIds.push(driver.id);

  const bookingQuery = {
    $and: [
      {
        $or: [
          ...(mongoose.isValidObjectId(booking_id) ? [{ _id: new mongoose.Types.ObjectId(booking_id) }] : []),
          { mysqlId: Number(booking_id) || -1 },
          { id: Number(booking_id) || -1 },
        ],
      },
      {
        $or: [
          { driver_id: { $in: driverIds } },
          { driver_mongo_id: driver._id },
        ],
      },
    ],
  };

  const booking = await Ride.findOne(bookingQuery);
  if (!booking) {
    return res.status(404).json({ message: "Invalid booking ID" });
  }

  try {
    const userQuery = [];
    if (booking.user_id) {
      if (mongoose.isValidObjectId(booking.user_id)) {
        userQuery.push({ _id: new mongoose.Types.ObjectId(booking.user_id) });
      }
      userQuery.push({ mysqlId: Number(booking.user_id) || -1 });
      userQuery.push({ id: Number(booking.user_id) || -1 });
    }
    if (booking.user_mongo_id) {
      userQuery.push({ _id: booking.user_mongo_id });
    }

    const getUser = await User.findOne(userQuery.length > 0 ? { $or: userQuery } : { _id: null });
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const receiveOtp = Math.floor(1000 + Math.random() * 9000);
    booking.otp = String(receiveOtp);
    booking.updated_at = new Date();
    await booking.save();

    const userPhone = getUser.number || getUser.phone || getUser.mobile;
    if (userPhone) {
      try {
        const cleanNumber = String(userPhone).replace(/\D/g, "").slice(-10);
        const message = `Your Bhrosa Cabs Ride Start OTP is ${receiveOtp}. Please share this OTP with your driver to begin your ride. Do not share this OTP with anyone else. It is valid for a limited time. Thanks, Bhrosa Group`;
        const url = new URL("https://msg.vadvertiseweb.com/submitsms.jsp");
        url.searchParams.append("user", "Bhrosa");
        url.searchParams.append("key", process.env.SMS_API_KEY || "a1461568f5XX");
        url.searchParams.append("mobile", cleanNumber);
        url.searchParams.append("message", message);
        url.searchParams.append("senderid", "BHRGRP");
        url.searchParams.append("accusage", "1");
        url.searchParams.append("entityid", "1701176768268781357");
        url.searchParams.append("tempid", "1707177755350501043");

        await fetch(url.toString(), { method: "GET", signal: AbortSignal.timeout(15000) });
      } catch (smsErr) {
        console.warn("Outstation Ride OTP SMS Warning:", smsErr.message);
      }
    }

    return res.status(200).json({
      status: true,
      message: "Outstation ride OTP Send successfully",
      otp: receiveOtp,
    });
  } catch (e) {
    console.error("Outstation Ride OTP Send Error: " + e.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: e.message,
    });
  }
};

// 14. DRIVER OTP VERIFY OUTSTATION
const driverOtpVerifyOutStation = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid driver token" });
  }

  const { booking_id, otp } = req.body;
  const errors = {};
  if (!booking_id) errors.booking_id = ["The booking_id field is required."];
  if (!otp) errors.otp = ["The otp field is required."];

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors,
    });
  }

  const driverIds = [driver._id];
  if (driver.mysqlId) driverIds.push(driver.mysqlId);
  if (driver.id && typeof driver.id === "number") driverIds.push(driver.id);

  const bookingQuery = {
    $and: [
      {
        $or: [
          ...(mongoose.isValidObjectId(booking_id) ? [{ _id: new mongoose.Types.ObjectId(booking_id) }] : []),
          { mysqlId: Number(booking_id) || -1 },
          { id: Number(booking_id) || -1 },
        ],
      },
      {
        $or: [
          { driver_id: { $in: driverIds } },
          { driver_mongo_id: driver._id },
        ],
      },
    ],
  };

  const booking = await Ride.findOne(bookingQuery);
  if (!booking) {
    return res.status(404).json({ message: "Invalid booking ID or OTP" });
  }

  if (String(booking.otp) !== String(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    booking.status = "in_progress";
    booking.otp = null;
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "Outstation ride started successfully",
    });
  } catch (e) {
    console.error("Outstation Ride OTP Verify Error: " + e.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: e.message,
    });
  }
};

// 15. DRIVER COMPLETE OTP OUTSTATION
const driverCompleteOtpOutStation = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid driver token" });
  }

  const { booking_id } = req.body;
  if (!booking_id) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: {
        booking_id: ["The booking_id field is required."],
      },
    });
  }

  const driverIds = [driver._id];
  if (driver.mysqlId) driverIds.push(driver.mysqlId);
  if (driver.id && typeof driver.id === "number") driverIds.push(driver.id);

  const bookingQuery = {
    $and: [
      {
        $or: [
          ...(mongoose.isValidObjectId(booking_id) ? [{ _id: new mongoose.Types.ObjectId(booking_id) }] : []),
          { mysqlId: Number(booking_id) || -1 },
          { id: Number(booking_id) || -1 },
        ],
      },
      {
        $or: [
          { driver_id: { $in: driverIds } },
          { driver_mongo_id: driver._id },
        ],
      },
    ],
  };

  const booking = await Ride.findOne(bookingQuery);
  if (!booking) {
    return res.status(404).json({ message: "Invalid booking ID" });
  }

  try {
    const userQuery = [];
    if (booking.user_id) {
      if (mongoose.isValidObjectId(booking.user_id)) {
        userQuery.push({ _id: new mongoose.Types.ObjectId(booking.user_id) });
      }
      userQuery.push({ mysqlId: Number(booking.user_id) || -1 });
      userQuery.push({ id: Number(booking.user_id) || -1 });
    }
    if (booking.user_mongo_id) {
      userQuery.push({ _id: booking.user_mongo_id });
    }

    const getUser = await User.findOne(userQuery.length > 0 ? { $or: userQuery } : { _id: null });
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const receiveOtp = Math.floor(1000 + Math.random() * 9000);
    booking.otp = String(receiveOtp);
    booking.updated_at = new Date();
    await booking.save();

    const userPhone = getUser.number || getUser.phone || getUser.mobile;
    if (userPhone) {
      try {
        const cleanNumber = String(userPhone).replace(/\D/g, "").slice(-10);
        const message = `Your Bhrosa Cabs Ride Completion OTP is ${receiveOtp}. Please share this OTP with your driver to complete your ride. Do not share this OTP with anyone else. It is valid for a limited time. Thanks, Bhrosa Group`;
        const url = new URL("https://msg.vadvertiseweb.com/submitsms.jsp");
        url.searchParams.append("user", "Bhrosa");
        url.searchParams.append("key", process.env.SMS_API_KEY || "a1461568f5XX");
        url.searchParams.append("mobile", cleanNumber);
        url.searchParams.append("message", message);
        url.searchParams.append("senderid", "BHRGRP");
        url.searchParams.append("accusage", "1");
        url.searchParams.append("entityid", "1701176768268781357");
        url.searchParams.append("tempid", "1707177755350501043");

        await fetch(url.toString(), { method: "GET", signal: AbortSignal.timeout(15000) });
      } catch (smsErr) {
        console.warn("Outstation Ride Completion OTP SMS Warning:", smsErr.message);
      }
    }

    return res.status(200).json({
      status: true,
      message: "Outstation ride OTP Send successfully",
      otp: receiveOtp,
    });
  } catch (e) {
    console.error("Outstation Ride OTP Send Error: " + e.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: e.message,
    });
  }
};

// 16. DRIVER COMPLETE OTP VERIFY OUTSTATION
const driverCompleteOtpVerifyOutStation = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Invalid Method" });
  }

  const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  const driver = await Driver.findOne({
    $or: [{ token: token }, { appToken: token }],
  });

  if (!driver) {
    return res.status(404).json({ message: "Invalid driver token" });
  }

  const { booking_id, otp } = req.body;
  const errors = {};
  if (!booking_id) errors.booking_id = ["The booking_id field is required."];
  if (!otp) errors.otp = ["The otp field is required."];

  if (Object.keys(errors).length > 0) {
    return res.status(422).json({
      message: "The given data was invalid.",
      errors,
    });
  }

  const driverIds = [driver._id];
  if (driver.mysqlId) driverIds.push(driver.mysqlId);
  if (driver.id && typeof driver.id === "number") driverIds.push(driver.id);

  const bookingQuery = {
    $and: [
      {
        $or: [
          ...(mongoose.isValidObjectId(booking_id) ? [{ _id: new mongoose.Types.ObjectId(booking_id) }] : []),
          { mysqlId: Number(booking_id) || -1 },
          { id: Number(booking_id) || -1 },
        ],
      },
      {
        $or: [
          { driver_id: { $in: driverIds } },
          { driver_mongo_id: driver._id },
        ],
      },
    ],
  };

  const booking = await Ride.findOne(bookingQuery);
  if (!booking) {
    return res.status(404).json({ message: "Invalid booking ID or OTP" });
  }

  if (String(booking.otp) !== String(otp)) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  try {
    booking.status = "completed";
    booking.otp = null;
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "Outstation ride completed successfully",
    });
  } catch (e) {
    console.error("Outstation Ride OTP Verify Error: " + e.message);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: e.message,
    });
  }
};

const driverCompleteOutStation = driverCompleteOtpVerifyOutStation;

// 17. DRIVER ACTIVE RIDE
const driverActiveRide = async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        message: "Invalid Method",
      });
    }

    const token = req.headers.token || req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) {
      return res.status(400).json({
        message: "Token not provided",
      });
    }

    const driver = await Driver.findOne({
      $or: [{ token: token }, { appToken: token }],
    });

    if (!driver) {
      return res.status(404).json({
        message: "Invalid driver token",
      });
    }

    const driverIds = [driver._id];
    if (driver.mysqlId) driverIds.push(driver.mysqlId);
    if (driver.id && typeof driver.id === "number") driverIds.push(driver.id);

    const booking = await Ride.findOne({
      $or: [
        { driver_id: { $in: driverIds } },
        { driver_mongo_id: driver._id },
      ],
      status: { $in: ["in_progress", "booked", "arrived"] },
    }).sort({ created_at: -1, _id: -1 });

    if (!booking) {
      return res.status(200).json({
        message: "No booking found",
      });
    }

    const bookingObj = booking.toObject ? booking.toObject() : booking;
    bookingObj.id = booking.mysqlId || booking._id;

    return res.status(200).json({
      message: "Driver location retrieved successfully",
      data: {
        id: driver.mysqlId || driver.id || driver._id,
        name: driver.name || "N/A",
        driver_latitude: driver.latitude ?? "N/A",
        driver_longitude: driver.longitude ?? "N/A",
        ride_deltails: bookingObj,
      },
    });
  } catch (ex) {
    return res.status(500).json({
      message: "An error occurred",
      details: ex.message,
    });
  }
};

// 17. USER OUTSTATION HISTORY
const userOutstationHistory = async (req, res) => {
  try {
    const user = req.user;
    const bookings = await Ride.find({ user_id: user._id, booking_type: "outStation" })
      .populate("driver_id", "name last_name number image")
      .sort({ created_at: -1 });

    const formatted = bookings.map((b) => ({
      id: b._id,
      from: b.from,
      to: b.to,
      distance: b.distance,
      totalFare: b.totalFare,
      driver_name: b.driver_id ? `${b.driver_id.name || ""} ${b.driver_id.last_name || ""}`.trim() : "Driver",
      driver_phone: b.driver_id?.number || "",
      driver_image: formatImageUrl(b.driver_id?.image),
      status: b.status,
      date: b.date || new Date(b.created_at).toLocaleDateString("en-GB"),
      time: b.time || new Date(b.created_at).toLocaleTimeString("en-US"),
    }));

    return res.status(200).json({ status: true, message: "User OutStation history", data: formatted });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
  }
};

// 18. DRIVER OUTSTATION HISTORY
const driverOutstationHistory = async (req, res) => {
  try {
    const driver = req.driver;
    const bookings = await Ride.find({ driver_id: driver._id, booking_type: "outStation" })
      .populate("user_id", "name number phone image")
      .sort({ created_at: -1 });

    const formatted = bookings.map((b) => ({
      id: b._id,
      from: b.from,
      to: b.to,
      distance: b.distance,
      totalFare: b.totalFare,
      user_name: b.user_id?.name || "Customer",
      user_phone: b.user_id?.number || b.user_id?.phone || "",
      user_image: formatImageUrl(b.user_id?.image),
      status: b.status,
      date: b.date || new Date(b.created_at).toLocaleDateString("en-GB"),
      time: b.time || new Date(b.created_at).toLocaleTimeString("en-US"),
    }));

    return res.status(200).json({ status: true, message: "Driver OutStation history", data: formatted });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
  }
};

/* =========================================================================
   ADMIN & CRM MANAGEMENT ENDPOINTS
   ========================================================================= */

// 19. GET ALL RIDES (With status filter, search, and pagination)
const getRides = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search = "" } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const filter = {};
    if (status && status !== "all") {
      if (status === "ongoing") {
        filter.status = { $in: ["ongoing", "in_progress"] };
      } else {
        filter.status = status;
      }
    }

    if (search.trim()) {
      const q = search.trim();
      filter.$or = [
        { from: { $regex: q, $options: "i" } },
        { to: { $regex: q, $options: "i" } },
        { totalFare: { $regex: q, $options: "i" } },
        { distance: { $regex: q, $options: "i" } },
      ];
    }

    const totalRecords = await Ride.countDocuments(filter);
    const rides = await Ride.find(filter)
      .populate("user_id", "name number phone image")
      .populate("driver_id", "name last_name number image cateogory")
      .populate("vehicle_id", "typeName icon")
      .sort({ created_at: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Check if caller is a sub-admin
    let isSubAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const rawToken = authHeader.split(" ")[1];
        const decoded = jwt.verify(rawToken, process.env.JWT_SECRET || "bhrosa_jwt_secret_key_2026");
        if (decoded && decoded.role === "subadmin") {
          isSubAdmin = true;
        }
      } catch (e) {}
    }

    const formattedRides = rides.map((r, index) => {
      const d = r.driver_id;
      const u = r.user_id;
      const v = r.vehicle_id;

      const dateObj = new Date(r.created_at || r.createdAt || Date.now());
      const dateStr = dateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const timeStr = dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: r._id.toString(),
        _id: r._id.toString(),
        srNo: skip + index + 1,
        userImage: formatImageUrl(u?.image, req),
        userName: u?.name || "Customer",
        userPhone: isSubAdmin ? "" : (u?.number || u?.phone || "+910000000000"),
        driverName: d ? `${d.name || ""} ${d.last_name || ""}`.trim() : "Not Assigned",
        driverPhone: isSubAdmin ? "" : (d?.number || ""),
        vehicleName: v?.typeName || "Sedan",
        vehicleRate: `₹${r.rideFare || 20.00} / Km`,
        from: r.from,
        to: r.to,
        distance: r.distance ? `${r.distance} Km` : "0.00 Km",
        waitingCharges: `₹${r.waitingCharge || 0} / ${r.waitingMinutes || 0} Minutes`,
        rideFare: `₹${r.rideFare || r.totalFare}`,
        fare: `₹${r.totalFare}`,
        totalFare: `₹${r.totalFare}`,
        status: r.status === "in_progress" ? "ongoing" : r.status,
        reason: r.reson || "No reason provided",
        date: r.date || dateStr,
        time: r.time || timeStr,
        bookingType: r.booking_type || "inCity",
      };
    });

    return res.status(200).json({
      success: true,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limitNum) || 1,
      currentPage: pageNum,
      rides: formattedRides,
    });
  } catch (error) {
    console.error("Error in getRides:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// 20. GET RIDE STATS FOR ADMIN DASHBOARD
const getRideStats = async (req, res) => {
  try {
    const [
      totalBooked,
      totalArrived,
      totalOngoing,
      totalCompleted,
      totalCancelled,
      totalRides,
    ] = await Promise.all([
      Ride.countDocuments({ status: "booked" }),
      Ride.countDocuments({ status: "arrived" }),
      Ride.countDocuments({ status: { $in: ["ongoing", "in_progress"] } }),
      Ride.countDocuments({ status: "completed" }),
      Ride.countDocuments({ status: "cancelled" }),
      Ride.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalBooked,
        totalArrived,
        totalOngoing,
        totalCompleted,
        totalCancelled,
        totalRides,
      },
    });
  } catch (error) {
    console.error("Error in getRideStats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getVehicleTypes,
  getVehicleTypeFare,
  getVehicleTypePrice,
  usePromoCode,
  getAvailableDrivers,
  userBookRide,
  userBookRideArrived,
  userRideStart,
  userRideComplete,
  userRideCancel,
  driverRideCancel,
  driverRideHistory,
  driverActiveRide,
  userRideHistory,
  userBookOutStation,
  driverStartOutStation,
  driverOtpVerifyOutStation,
  driverCompleteOtpOutStation,
  driverCompleteOtpVerifyOutStation,
  driverCompleteOutStation,
  userOutstationHistory,
  driverOutstationHistory,
  getRides,
  getRideStats,
};
