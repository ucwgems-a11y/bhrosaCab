const User = require("../models/User");
const Driver = require("../models/Driver");
const Ride = require("../models/Ride");
const PriceFare = require("../models/PriceFare");
const CarType = require("../models/CarType");
const AppSetting = require("../models/AppSetting");

// Helper to format S3 / local image URLs
const formatImageUrl = (imgPath, req) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) {
    return imgPath;
  }
  const cleanPath = imgPath.replace(/^\/?uploads\/?/, "").replace(/^\//, "");
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${cleanPath}`;
};

// @desc    Get Comprehensive Live Dashboard Analytics (Admin & CRM)
// @route   GET /api/dashboard/analytics, GET /api/dashboard/stats
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // Start of Today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Start of 7 days ago
    const startOfWeekly = new Date(now);
    startOfWeekly.setDate(startOfWeekly.getDate() - 6);
    startOfWeekly.setHours(0, 0, 0, 0);

    // Start of Current Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Parallel Count Queries
    const [
      totalUsers,
      todayUsers,
      totalDrivers,
      activeDrivers,
      totalBooked,
      totalArrived,
      totalOngoing,
      totalCompleted,
      totalCancelled,
      totalRides,
      completedRides,
      recentUsersRaw,
      priceFares,
      carTypes,
      minWalletSetting,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      Driver.countDocuments(),
      Driver.countDocuments({ active_status: 1 }),
      Ride.countDocuments({ status: "booked" }),
      Ride.countDocuments({ status: "arrived" }),
      Ride.countDocuments({ status: { $in: ["ongoing", "in_progress"] } }),
      Ride.countDocuments({ status: "completed" }),
      Ride.countDocuments({ status: "cancelled" }),
      Ride.countDocuments(),
      Ride.find({ status: "completed" }).lean(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select("_id mysqlId name phone image createdAt isRegistered")
        .lean(),
      PriceFare.find({ status: "1" }).populate("carType").lean(),
      CarType.find({ status: "1" }).lean(),
      AppSetting.findOne({ key: "minDriverWalletAmount" }).lean(),
    ]);

    // Map car types for easy lookup
    const carTypeMap = {};
    carTypes.forEach((ct) => {
      carTypeMap[ct.mysqlId || ct._id] = ct.typeName;
    });

    // 2. Calculate Earnings (Today, Weekly, Monthly, All-time)
    let todayEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;
    let totalEarnings = 0;

    // Hourly buckets for Today's chart: 6 AM, 9 AM, 12 PM, 3 PM, 6 PM, 9 PM
    const todayBuckets = [
      { time: "6 AM", startH: 0, endH: 6, value: 0 },
      { time: "9 AM", startH: 6, endH: 9, value: 0 },
      { time: "12 PM", startH: 9, endH: 12, value: 0 },
      { time: "3 PM", startH: 12, endH: 15, value: 0 },
      { time: "6 PM", startH: 15, endH: 18, value: 0 },
      { time: "9 PM", startH: 18, endH: 24, value: 0 },
    ];

    // Weekly day-by-day buckets (last 7 days)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyBuckets = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      weeklyBuckets.push({
        dateStr: d.toISOString().split("T")[0],
        time: dayNames[d.getDay()],
        value: 0,
      });
    }

    // Monthly day intervals (Day 1 to Day 30)
    const monthlyBuckets = [];
    for (let d = 1; d <= 30; d += 2) {
      monthlyBuckets.push({
        day: `Day ${d}`,
        dayNum: d,
        value: 0,
      });
    }

    completedRides.forEach((ride) => {
      const fare = Number(ride.totalFare || ride.rideFare || ride.final_fare || ride.estimate_fare || 0);
      const rideDate = new Date(ride.updated_at || ride.created_at || ride.createdAt || now);
      totalEarnings += fare;

      // Check Today
      if (rideDate >= startOfToday) {
        todayEarnings += fare;
        const h = rideDate.getHours();
        const b = todayBuckets.find((tb) => h >= tb.startH && h < tb.endH);
        if (b) b.value += fare;
      }

      // Check Weekly
      if (rideDate >= startOfWeekly) {
        weeklyEarnings += fare;
        const rideDateStr = rideDate.toISOString().split("T")[0];
        const wb = weeklyBuckets.find((b) => b.dateStr === rideDateStr);
        if (wb) wb.value += fare;
      }

      // Check Monthly
      if (rideDate >= startOfMonth) {
        monthlyEarnings += fare;
        const dom = rideDate.getDate();
        // find closest monthly bucket
        const mb = monthlyBuckets.reduce((prev, curr) =>
          Math.abs(curr.dayNum - dom) < Math.abs(prev.dayNum - dom) ? curr : prev
        );
        if (mb) mb.value += fare;
      }
    });

    // 3. Calculate Users Registrations for Chart (Today, Weekly, Monthly)
    const allUsers = await User.find().select("createdAt").lean();
    let weeklyUsersCount = 0;
    let monthlyUsersCount = 0;

    const weeklyUsersBuckets = weeklyBuckets.map((wb) => ({
      time: wb.time,
      dateStr: wb.dateStr,
      value: 0,
    }));

    allUsers.forEach((u) => {
      const uDate = new Date(u.createdAt || now);
      if (uDate >= startOfWeekly) {
        weeklyUsersCount++;
        const uDateStr = uDate.toISOString().split("T")[0];
        const ub = weeklyUsersBuckets.find((b) => b.dateStr === uDateStr);
        if (ub) ub.value++;
      }
      if (uDate >= startOfMonth) {
        monthlyUsersCount++;
      }
    });

    // 4. Format Recent Users
    const recentUsers = recentUsersRaw.map((u) => {
      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        u.name || "User"
      )}&background=random`;
      return {
        id: u.mysqlId || u._id,
        _id: u._id,
        name: u.name || "User",
        phone: u.phone || "",
        image: u.image ? formatImageUrl(u.image, req) : defaultAvatar,
        createdAt: u.createdAt,
      };
    });

    // 5. Format Vehicle Fares
    const fareCards = priceFares.map((f) => {
      const typeName = f.carType?.typeName || carTypeMap[f.vehicleType] || "Vehicle";
      const rawFrom = f.farePerKm || "0.00";
      const rawTo = f.farePerKmTo || "";
      return {
        id: f.mysqlId || f._id,
        _id: f._id,
        vehicleType: String(f.vehicleType),
        vehicleTypeName: typeName,
        rawFarePerKm: rawFrom,
        rawFarePerKmTo: rawTo,
        farePerKm: `₹ ${Number(rawFrom).toFixed(2)}`,
        farePerKmTo: rawTo ? `₹ ${Number(rawTo).toFixed(2)}` : "",
        priceText: rawTo ? `₹ ${Number(rawFrom).toFixed(2)} to ${Number(rawTo).toFixed(2)}` : `₹ ${Number(rawFrom).toFixed(2)}`,
        image: f.image ? formatImageUrl(f.image, req) : null,
      };
    });

    const minWalletAmount = minWalletSetting ? String(minWalletSetting.value) : "10";

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        todayUsers,
        weeklyUsers: weeklyUsersCount,
        monthlyUsers: monthlyUsersCount,
        totalDrivers,
        activeDrivers,
        totalBooked,
        totalArrived,
        totalOngoing,
        totalCompleted,
        totalCancelled,
        totalRides,
        minDriverWallet: minWalletAmount,
      },
      earnings: {
        today: todayEarnings.toFixed(2),
        weekly: weeklyEarnings.toFixed(2),
        monthly: monthlyEarnings.toFixed(2),
        total: totalEarnings.toFixed(2),
        chartData: {
          Today: todayBuckets.map((b) => ({ time: b.time, value: b.value })),
          Weekly: weeklyBuckets.map((b) => ({ time: b.time, value: b.value })),
          Monthly: monthlyBuckets.map((b) => ({ day: b.day, time: b.day, value: b.value })),
        },
      },
      usersData: {
        today: todayUsers,
        weekly: weeklyUsersCount,
        monthly: monthlyUsersCount,
        total: totalUsers,
        chartData: {
          Today: [{ time: "Today", period: "Today", value: todayUsers }],
          Weekly: weeklyUsersBuckets.map((b) => ({ time: b.time, period: b.time, value: b.value })),
          Monthly: [{ time: "Monthly", period: "Monthly", value: monthlyUsersCount }],
        },
      },
      fareCards,
      recentUsers,
    });
  } catch (error) {
    console.error("getDashboardAnalytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
      error: error.message,
    });
  }
};

// @desc    Get Min Driver Wallet Setting
// @route   GET /api/dashboard/min-wallet
exports.getMinWallet = async (req, res) => {
  try {
    const setting = await AppSetting.findOne({ key: "minDriverWalletAmount" });
    return res.status(200).json({
      success: true,
      minWallet: setting ? String(setting.value) : "10",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Min Driver Wallet Setting
// @route   POST /api/dashboard/min-wallet, PUT /api/dashboard/min-wallet
exports.updateMinWallet = async (req, res) => {
  try {
    const { amount, minWallet } = req.body;
    const value = String(amount !== undefined ? amount : minWallet || "10").trim();

    const setting = await AppSetting.findOneAndUpdate(
      { key: "minDriverWalletAmount" },
      { key: "minDriverWalletAmount", value, description: "Minimum driver wallet balance required to accept rides" },
      { upsert: true, returnDocument: 'after' }
    );

    return res.status(200).json({
      success: true,
      message: "Minimum driver wallet amount updated successfully",
      minWallet: String(setting.value),
    });
  } catch (error) {
    console.error("updateMinWallet Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
