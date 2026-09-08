/**
 * =========================================================================
 * RIDE & BOOKING CONTROLLER (PHP SOURCE OF TRUTH MIGRATION)
 * =========================================================================
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
const getVehicleTypes = async (req, res) => {
  try {
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
    console.error("Error in getVehicleTypes:", error);
    return res.status(500).json({
      message: "An error occurred while fetching price fares",
      error: error.message,
    });
  }
};

// 2. GET VEHICLE TYPE FARE (Estimated Fare Calculation)
const getVehicleTypeFare = async (req, res) => {
  try {
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
        const typeName = carType?.typeName || "";
        if (typeName.toLowerCase().includes("hatchback")) {
          total_price = 30;
        } else if (typeName.toLowerCase().includes("sedan")) {
          total_price = 40;
        } else {
          total_price = 90;
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
        vehicle_id: carType?._id || fare.vehicleType,
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

// 3. GET AVAILABLE NEARBY DRIVERS (Haversine 20 KM Radius)
const getAvailableDrivers = async (req, res) => {
  try {
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
      query.$or = [
        { cateogory: vehicle_id },
        { cateogory: String(vehicle_id) },
      ];
    }

    const drivers = await Driver.find(query);

    // Get topup requirements
    const topups = await DriverTopup.find();
    const topupMap = {};
    topups.forEach((t) => {
      topupMap[String(t.car_type_id)] = t.topup_amount || 0;
    });

    const nearbyDrivers = [];

    for (const d of drivers) {
      const dLat = parseFloat(d.latitude);
      const dLng = parseFloat(d.longitude);
      if (isNaN(dLat) || isNaN(dLng)) continue;

      // Minimum wallet requirement
      const requiredWallet = topupMap[String(d.cateogory)] || 0;
      if ((d.wallet || 0) < requiredWallet) continue;

      // Haversine formula
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
        nearbyDrivers.push({
          id: d._id,
          name: d.name ? `${d.name} ${d.last_name || ""}`.trim() : "Driver",
          number: d.number,
          image: formatImageUrl(d.image),
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
const userBookRide = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "Invalid user token" });
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

    if (!driver_id || !vehicle_id || !from || !to || !totalFare) {
      return res.status(400).json({ message: "Missing required booking details" });
    }

    // Single Active Ride Validation: Prevent booking if user already has an active ride
    const existingActiveRide = await Ride.findOne({
      user_id: { $in: [user._id, String(user._id)] },
      status: { $in: ["booked", "arrived", "ongoing", "in_progress"] },
    });

    if (existingActiveRide) {
      return res.status(400).json({
        status: false,
        message: "You already have an active ride in progress. Please complete or cancel your current ride before booking a new one.",
        active_booking_id: existingActiveRide._id,
        current_status: existingActiveRide.status,
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Ride.create({
      user_id: user._id,
      driver_id: mongoose.isValidObjectId(driver_id) ? new mongoose.Types.ObjectId(driver_id) : driver_id,
      vehicle_id: mongoose.isValidObjectId(vehicle_id) ? new mongoose.Types.ObjectId(vehicle_id) : vehicle_id,
      from,
      from_lat: String(fromLat || "0"),
      from_lng: String(fromLng || "0"),
      to,
      to_lat: String(toLat || "0"),
      to_lng: String(toLng || "0"),
      rideFare: parseFloat(totalFare) || 0,
      totalFare: String(totalFare),
      distance: String(distance || "0"),
      otp,
      status: "booked",
      booking_type: "inCity",
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(200).json({
      status: true,
      message: "Ride booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Error in userBookRide:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 5. DRIVER ARRIVED AT PICKUP
const userBookRideArrived = async (req, res) => {
  try {
    const driver = req.driver;
    const body = req.body || {};
    const booking_id = body.booking_id || req?.query?.booking_id;

    if (!booking_id) {
      return res.status(400).json({ message: "Booking ID is required" });
    }

    const queryId = mongoose.isValidObjectId(booking_id) ? new mongoose.Types.ObjectId(booking_id) : booking_id;
    const booking = await Ride.findOne({
      _id: queryId,
      driver_id: { $in: [driver._id, String(driver._id)] },
      status: "booked",
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid booking ID or ride status" });
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.status = "arrived";
    booking.otp = newOtp;
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "Ride arrived successfully",
    });
  } catch (error) {
    console.error("Error in userBookRideArrived:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 6. DRIVER START RIDE (Verify OTP)
const userRideStart = async (req, res) => {
  try {
    const driver = req.driver;
    const body = req.body || {};
    const booking_id = body.booking_id || req?.query?.booking_id;
    const otp = body.otp || req?.query?.otp;
    const waitingMinutes = body.waitingMinutes || req?.query?.waitingMinutes;
    const waitingCharge = body.waitingCharge || req?.query?.waitingCharge;

    if (!booking_id || !otp) {
      return res.status(400).json({ message: "Booking ID and OTP are required" });
    }

    const queryId = mongoose.isValidObjectId(booking_id) ? new mongoose.Types.ObjectId(booking_id) : booking_id;
    const booking = await Ride.findOne({
      _id: queryId,
      driver_id: { $in: [driver._id, String(driver._id)] },
      otp: String(otp),
      status: { $in: ["booked", "arrived"] },
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid booking ID or OTP" });
    }

    const wMins = parseInt(waitingMinutes) || 0;
    const wCharge = parseFloat(waitingCharge) || 0;
    const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();

    booking.status = "ongoing"; // in_progress
    booking.otp = completionOtp;
    booking.waitingMinutes = wMins;
    booking.waitingCharge = wCharge;
    booking.totalFare = String((parseFloat(booking.totalFare) || 0) + wCharge);
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "Ride started successfully",
      data: {
        booking_id: booking._id,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Error in userRideStart:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 7. DRIVER COMPLETE RIDE (Auto Commission Settlement)
const userRideComplete = async (req, res) => {
  try {
    const driver = req.driver;
    const body = req.body || {};
    const booking_id = body.booking_id || req?.query?.booking_id;
    const otp = body.otp || req?.query?.otp;

    if (!booking_id || !otp) {
      return res.status(400).json({ message: "Booking ID and OTP are required" });
    }

    const queryId = mongoose.isValidObjectId(booking_id) ? new mongoose.Types.ObjectId(booking_id) : booking_id;
    const booking = await Ride.findOne({
      _id: queryId,
      driver_id: { $in: [driver._id, String(driver._id)] },
      otp: String(otp),
      status: { $in: ["ongoing", "in_progress"] },
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid booking ID, OTP, or ride status" });
    }

    booking.otp = null;
    booking.status = "completed";
    booking.updated_at = new Date();
    await booking.save();

    // Check Driver Topup rules for platform commission
    const driverTopup = await DriverTopup.findOne({
      $or: [
        { car_type_id: driver.cateogory },
        { car_type_id: String(driver.cateogory) },
      ],
    });

    if (driverTopup) {
      const bFare = parseFloat(booking.totalFare) || 0;
      const bDist = parseFloat(booking.distance) || 0;

      // 1. Extra charge percentage
      if (!driverTopup.slabs && !driverTopup.above_distance && driverTopup.extra_charge) {
        const ecRate = parseFloat(driverTopup.extra_charge) || 0;
        const extraCommission = Math.round(((bFare / 100) * ecRate) * 100) / 100;
        if (!isNaN(extraCommission) && extraCommission > 0) {
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
      }
      // 2. Above distance charges
      else if (driverTopup.above_distance && driverTopup.extra_charge && bDist >= driverTopup.above_distance) {
        const ecRate = parseFloat(driverTopup.extra_charge) || 0;
        const extraCommission = Math.round(((bFare / 100) * ecRate) * 100) / 100;
        if (!isNaN(extraCommission) && extraCommission > 0) {
          driver.wallet = (parseFloat(driver.wallet) || 0) - extraCommission;
          await driver.save();

          booking.aboveDistanceKm = driverTopup.above_distance;
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
      }
      // 3. Slabs deduction
      else if (driverTopup.slabs) {
        const unpaidRidesTotal = await Ride.aggregate([
          { $match: { driver_id: driver._id, commission_status: 0 } },
          { $group: { _id: null, total: { $sum: { $toDouble: "$totalFare" } } } },
        ]);
        const sumUnpaid = unpaidRidesTotal[0]?.total || 0;

        if (sumUnpaid >= (parseFloat(driverTopup.slabs) || 0)) {
          const slabTopupAmt = parseFloat(driverTopup.topup_amount) || 0;
          driver.wallet = (parseFloat(driver.wallet) || 0) - slabTopupAmt;
          await driver.save();

          await Ride.updateMany(
            { driver_id: driver._id, commission_status: 0 },
            { $set: { commission_status: 1 } }
          );

          await DriverWalletRecharge.create({
            driver_id: driver._id,
            amount: `-${slabTopupAmt}`,
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
        booking_id: booking._id,
        status: booking.status,
        wallet: driver.wallet,
      },
    });
  } catch (error) {
    console.error("Error in userRideComplete:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 8. USER CANCEL RIDE (Compensate Driver +₹50)
const userRideCancel = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body || {};
    const booking_id = body.booking_id || req?.query?.booking_id;
    const reason = body.reason || req?.query?.reason;

    const queryId = mongoose.isValidObjectId(booking_id) ? new mongoose.Types.ObjectId(booking_id) : booking_id;
    const booking = await Ride.findOne({
      _id: queryId,
      user_id: { $in: [user._id, String(user._id)] },
      status: { $in: ["booked", "arrived"] },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or ride cannot be cancelled" });
    }

    const cancelReason = reason || "No reason provided";
    booking.status = "cancelled";
    booking.reson = `User ${user.name || "Customer"}: ${cancelReason}`;
    booking.otp = null;
    booking.updated_at = new Date();
    await booking.save();

    await UserRideCancel.create({
      user_booking_id: booking._id,
      fine: 90,
    });

    // Compensate driver with +50
    if (booking.driver_id) {
      const driver = await Driver.findById(booking.driver_id);
      if (driver) {
        driver.wallet = (driver.wallet || 0) + 50;
        await driver.save();

        await DriverWalletRecharge.create({
          driver_id: driver._id,
          amount: "+50",
          status: "1",
          transaction_id: `Booking ID: ${booking._id} - Ride Cancel Charge (Cancel by User)`,
          booking_id: booking._id,
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Ride cancelled successfully",
      data: {
        booking_id: booking._id,
        status: booking.status,
        reason: booking.reson,
      },
    });
  } catch (error) {
    console.error("Error in userRideCancel:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 9. DRIVER CANCEL RIDE (Penalty -₹50)
const driverRideCancel = async (req, res) => {
  try {
    const driver = req.driver;
    const body = req.body || {};
    const booking_id = body.booking_id || req?.query?.booking_id;
    const reason = body.reason || req?.query?.reason;

    const queryId = mongoose.isValidObjectId(booking_id) ? new mongoose.Types.ObjectId(booking_id) : booking_id;
    const booking = await Ride.findOne({
      _id: queryId,
      driver_id: { $in: [driver._id, String(driver._id)] },
      status: { $in: ["booked", "arrived"] },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or ride cannot be cancelled" });
    }

    const cancelReason = reason || "No reason provided";
    booking.status = "cancelled";
    booking.reson = `Driver ${driver.name || "Driver"}: ${cancelReason}`;
    booking.otp = null;
    booking.updated_at = new Date();
    await booking.save();

    // Deduct 50 penalty from driver
    driver.wallet = (driver.wallet || 0) - 50;
    await driver.save();

    await DriverWalletRecharge.create({
      driver_id: driver._id,
      amount: "-50",
      status: "1",
      transaction_id: `Booking ID ${booking._id} - Driver Ride Cancel Charge (Cancel By Driver)`,
      booking_id: booking._id,
    });

    return res.status(200).json({
      status: true,
      message: "Ride cancelled successfully",
      data: {
        booking_id: booking._id,
        status: booking.status,
        reason: booking.reson,
      },
    });
  } catch (error) {
    console.error("Error in driverRideCancel:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

// 10. DRIVER RIDE HISTORY & EARNINGS
const driverRideHistory = async (req, res) => {
  try {
    const driver = req.driver;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Earnings aggregation
    const earnings = await Ride.aggregate([
      { $match: { driver_id: { $in: [driver._id, String(driver._id)] }, status: "completed" } },
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

    const earningSummary = earnings[0] || { today: 0, this_week: 0, this_month: 0, this_year: 0 };

    const bookings = await Ride.find({ driver_id: { $in: [driver._id, String(driver._id)] }, booking_type: "inCity" })
      .populate("user_id", "name number phone image")
      .sort({ created_at: -1 });

    const formattedBookings = bookings.map((b) => ({
      id: b._id,
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
      user_name: b.user_id?.name || "Customer",
      user_phone: b.user_id?.number || b.user_id?.phone || "",
      user_image: formatImageUrl(b.user_id?.image),
      status: b.status,
      date: b.date || new Date(b.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: b.time || new Date(b.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }));

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
const userRideHistory = async (req, res) => {
  try {
    const user = req.user;

    const bookings = await Ride.find({ user_id: { $in: [user._id, String(user._id)] }, booking_type: "inCity" })
      .populate("driver_id", "name last_name number image")
      .sort({ created_at: -1 });

    const formattedBookings = bookings.map((b) => ({
      id: b._id,
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
      driver_name: b.driver_id ? `${b.driver_id.name || ""} ${b.driver_id.last_name || ""}`.trim() : "Driver",
      driver_phone: b.driver_id?.number || "",
      driver_image: formatImageUrl(b.driver_id?.image),
      status: b.status,
      date: b.date || new Date(b.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: b.time || new Date(b.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }));

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
const userBookOutStation = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "Invalid user token" });

    const {
      driver_id,
      vehicle_id,
      from,
      fromLat,
      fromLng,
      to,
      toLat,
      toLng,
      totalFare,
      distance,
      date,
      time,
    } = req.body;

    // Single Active Ride Validation: Prevent booking if user already has an active ride
    const existingActiveRide = await Ride.findOne({
      user_id: { $in: [user._id, String(user._id)] },
      status: { $in: ["booked", "arrived", "ongoing", "in_progress"] },
    });

    if (existingActiveRide) {
      return res.status(400).json({
        status: false,
        message: "You already have an active ride in progress. Please complete or cancel your current ride before booking a new one.",
        active_booking_id: existingActiveRide._id,
        current_status: existingActiveRide.status,
      });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await Ride.create({
      user_id: user._id,
      driver_id: driver_id || null,
      vehicle_id: vehicle_id,
      from,
      from_lat: String(fromLat || "0"),
      from_lng: String(fromLng || "0"),
      to,
      to_lat: String(toLat || "0"),
      to_lng: String(toLng || "0"),
      rideFare: parseFloat(totalFare) || 0,
      totalFare: String(totalFare),
      distance: String(distance || "0"),
      date: date || null,
      time: time || null,
      otp,
      status: "booked",
      booking_type: "outStation",
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(200).json({
      status: true,
      message: "OutStation ride booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Error in userBookOutStation:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
  }
};

// 13. DRIVER START OUTSTATION
const driverStartOutStation = async (req, res) => {
  try {
    const driver = req.driver;
    const { booking_id } = req.body;

    const booking = await Ride.findOne({
      _id: mongoose.isValidObjectId(booking_id) ? booking_id : undefined,
      driver_id: driver._id,
      booking_type: "outStation",
    });

    if (!booking) {
      return res.status(404).json({ message: "OutStation booking not found" });
    }

    booking.status = "arrived";
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "OutStation ride started / arrived",
    });
  } catch (error) {
    console.error("Error in driverStartOutStation:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
  }
};

// 14. DRIVER OTP VERIFY OUTSTATION
const driverOtpVerifyOutStation = async (req, res) => {
  try {
    const driver = req.driver;
    const { booking_id, otp } = req.body;

    const booking = await Ride.findOne({
      _id: mongoose.isValidObjectId(booking_id) ? booking_id : undefined,
      driver_id: driver._id,
      otp: String(otp),
      booking_type: "outStation",
    });

    if (!booking) {
      return res.status(404).json({ message: "Invalid OTP or OutStation booking ID" });
    }

    const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.status = "ongoing";
    booking.otp = completionOtp;
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "OutStation OTP verified successfully",
      data: { booking_id: booking._id, status: booking.status },
    });
  } catch (error) {
    console.error("Error in driverOtpVerifyOutStation:", error);
    return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
  }
};

// 15. DRIVER COMPLETE OTP OUTSTATION
const driverCompleteOtpOutStation = async (req, res) => {
  try {
    const driver = req.driver;
    const { booking_id } = req.body;

    const booking = await Ride.findOne({
      _id: mongoose.isValidObjectId(booking_id) ? booking_id : undefined,
      driver_id: driver._id,
      booking_type: "outStation",
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const completionOtp = Math.floor(1000 + Math.random() * 9000).toString();
    booking.otp = completionOtp;
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "Completion OTP generated",
      otp: completionOtp,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
  }
};

// 16. DRIVER COMPLETE OUTSTATION
const driverCompleteOutStation = async (req, res) => {
  try {
    const driver = req.driver;
    const { booking_id, otp } = req.body;

    const booking = await Ride.findOne({
      _id: mongoose.isValidObjectId(booking_id) ? booking_id : undefined,
      driver_id: driver._id,
      otp: String(otp),
      booking_type: "outStation",
    });

    if (!booking) return res.status(404).json({ message: "Invalid OTP or Booking" });

    booking.status = "completed";
    booking.otp = null;
    booking.updated_at = new Date();
    await booking.save();

    return res.status(200).json({
      status: true,
      message: "OutStation ride completed successfully",
      data: { booking_id: booking._id, status: booking.status },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
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
  getAvailableDrivers,
  userBookRide,
  userBookRideArrived,
  userRideStart,
  userRideComplete,
  userRideCancel,
  driverRideCancel,
  driverRideHistory,
  userRideHistory,
  userBookOutStation,
  driverStartOutStation,
  driverOtpVerifyOutStation,
  driverCompleteOtpOutStation,
  driverCompleteOutStation,
  userOutstationHistory,
  driverOutstationHistory,
  getRides,
  getRideStats,
};
