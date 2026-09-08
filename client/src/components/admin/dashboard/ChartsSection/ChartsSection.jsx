import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./ChartsSection.css";

const defaultEarningsChart = {
  Today: [
    { time: "6 AM", value: 0 },
    { time: "9 AM", value: 0 },
    { time: "12 PM", value: 0 },
    { time: "3 PM", value: 0 },
    { time: "6 PM", value: 0 },
    { time: "9 PM", value: 0 },
  ],
  Weekly: [
    { time: "Mon", value: 0 },
    { time: "Tue", value: 0 },
    { time: "Wed", value: 0 },
    { time: "Thu", value: 0 },
    { time: "Fri", value: 0 },
    { time: "Sat", value: 0 },
    { time: "Sun", value: 0 },
  ],
  Monthly: [
    { day: "Day 1", time: "Day 1", value: 0 },
    { day: "Day 5", time: "Day 5", value: 0 },
    { day: "Day 10", time: "Day 10", value: 0 },
    { day: "Day 15", time: "Day 15", value: 0 },
    { day: "Day 20", time: "Day 20", value: 0 },
    { day: "Day 25", time: "Day 25", value: 0 },
    { day: "Day 30", time: "Day 30", value: 0 },
  ],
};

const defaultUsersChart = {
  Today: [{ time: "Today", period: "Today", value: 0 }],
  Weekly: [
    { time: "Mon", period: "Mon", value: 0 },
    { time: "Tue", period: "Tue", value: 0 },
    { time: "Wed", period: "Wed", value: 0 },
    { time: "Thu", period: "Thu", value: 0 },
    { time: "Fri", period: "Fri", value: 0 },
    { time: "Sat", period: "Sat", value: 0 },
    { time: "Sun", period: "Sun", value: 0 },
  ],
  Monthly: [{ time: "Monthly", period: "Monthly", value: 0 }],
};

const periods = ["Today", "Weekly", "Monthly"];

export default function ChartsSection({ earningsDataProps, usersDataProps }) {
  const [earningsPeriod, setEarningsPeriod] = useState("Monthly");
  const [usersPeriod, setUsersPeriod] = useState("Monthly");

  // Dynamic earnings totals & chart series
  const earningsAmountMap = {
    Today: `₹ ${earningsDataProps?.today || "0.00"}`,
    Weekly: `₹ ${earningsDataProps?.weekly || "0.00"}`,
    Monthly: `₹ ${earningsDataProps?.monthly || "0.00"}`,
  };

  const activeEarningsData =
    earningsDataProps?.chartData?.[earningsPeriod] || defaultEarningsChart[earningsPeriod];

  // Dynamic user counts & chart series
  const usersCountMap = {
    Today: String(usersDataProps?.today || "0"),
    Weekly: String(usersDataProps?.weekly || "0"),
    Monthly: String(usersDataProps?.monthly || "0"),
  };

  const activeUsersData =
    usersDataProps?.chartData?.[usersPeriod] || defaultUsersChart[usersPeriod];

  return (
    <div className="charts-section">
      {/* ============ Earnings chart (line) ============ */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3>Earning</h3>
          </div>
          <div className="chart-card-summary">
            <span className="chart-card-summary-label">{earningsPeriod} Earnings</span>
            <span className="chart-card-summary-value">{earningsAmountMap[earningsPeriod]}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={activeEarningsData}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} />
            <Tooltip
              formatter={(val) => [`₹ ${Number(val).toFixed(2)}`, "Earnings"]}
              contentStyle={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2e9e5b"
              strokeWidth={2}
              dot={{ r: 3, fill: "#2e9e5b" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="chart-period-buttons">
          {periods.map((p) => (
            <button
              key={p}
              className={earningsPeriod === p ? "active" : ""}
              onClick={() => setEarningsPeriod(p)}
              type="button"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ============ Users chart (bar) ============ */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3>Users</h3>
          </div>
          <div className="chart-card-summary">
            <span className="chart-card-summary-label">{usersPeriod} Users</span>
            <span className="chart-card-summary-value">{usersCountMap[usersPeriod]}</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={activeUsersData}>
            <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" />
            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} />
            <YAxis stroke="var(--text-muted)" fontSize={11} allowDecimals={false} />
            <Tooltip
              formatter={(val) => [val, "Registered Users"]}
              contentStyle={{
                background: "var(--bg-panel)",
                border: "1px solid var(--border-color)",
                borderRadius: 8,
                color: "var(--text-primary)",
              }}
            />
            <Bar dataKey="value" fill="#7fc4e8" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="chart-period-buttons">
          {periods.map((p) => (
            <button
              key={p}
              className={usersPeriod === p ? "active" : ""}
              onClick={() => setUsersPeriod(p)}
              type="button"
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
