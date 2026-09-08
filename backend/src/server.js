require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

connectDB().then(() => {
  // Check on startup if 1st of month payout is due
  const { runMonthlyPayoutSchedule } = require("./controllers/driverController");
  runMonthlyPayoutSchedule();
  // Check every 6 hours
  setInterval(runMonthlyPayoutSchedule, 6 * 60 * 60 * 1000);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});