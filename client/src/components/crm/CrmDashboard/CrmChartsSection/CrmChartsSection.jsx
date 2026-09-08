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
import "./CrmChartsSection.css";

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
    { time: "Day 1", value: 0 },
    { time: "Day 5", value: 0 },
    { time: "Day 10", value: 0 },
    { time: "Day 15", value: 0 },
    { time: "Day 20", value: 0 },
    { time: "Day 25", value: 0 },
    { time: "Day 30", value: 0 },
  ],
};

const defaultUsersChart = {
  Today: [{ time: "Today", value: 0 }],
  Weekly: [
    { time: "Mon", value: 0 },
    { time: "Tue", value: 0 },
    { time: "Wed", value: 0 },
    { time: "Thu", value: 0 },
    { time: "Fri", value: 0 },
    { time: "Sat", value: 0 },
    { time: "Sun", value: 0 },
  ],
  Monthly: [{ time: "Monthly", value: 0 }],
};

const periods = ["Today", "Weekly", "Monthly"];

export default function CrmChartsSection({ earningsDataProps, usersDataProps }) {
  const [earningsPeriod, setEarningsPeriod] = useState("Today");
  const [usersPeriod, setUsersPeriod] = useState("Today");

  const earningsAmountMap = {
    Today: { label: "Today's Earnings", value: `₹ ${earningsDataProps?.today || "0.00"}` },
    Weekly: { label: "Weekly Earnings", value: `₹ ${earningsDataProps?.weekly || "0.00"}` },
    Monthly: { label: "Monthly Earnings", value: `₹ ${earningsDataProps?.monthly || "0.00"}` },
  };

  const usersCountMap = {
    Today: { label: "Today's Users", value: String(usersDataProps?.today || "0") },
    Weekly: { label: "Weekly Users", value: String(usersDataProps?.weekly || "0") },
    Monthly: { label: "Monthly Users", value: String(usersDataProps?.monthly || "0") },
  };

  const activeEarningsData =
    earningsDataProps?.chartData?.[earningsPeriod] || defaultEarningsChart[earningsPeriod];

  const activeUsersData =
    usersDataProps?.chartData?.[usersPeriod] || defaultUsersChart[usersPeriod];

  return (
    <div className="crm-charts-section">
      {/* Earning Chart Card */}
      <div className="crm-chart-card">
        <div className="crm-chart-card-header">
          <div>
            <h3 className="crm-chart-title">Earning</h3>
          </div>
          <div className="crm-chart-summary">
            <span className="crm-chart-summary-label">
              {earningsAmountMap[earningsPeriod].label}
            </span>
            <span className="crm-chart-summary-value">
              {earningsAmountMap[earningsPeriod].value}
            </span>
          </div>
        </div>

        <div className="crm-chart-body">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={activeEarningsData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <Tooltip
                formatter={(val) => [`₹ ${Number(val).toFixed(2)}`, "Earnings"]}
                contentStyle={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--accent)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="crm-chart-actions">
            {periods.map((p) => (
              <button
                key={p}
                className={`crm-chart-tab ${earningsPeriod === p ? "active" : ""}`}
                onClick={() => setEarningsPeriod(p)}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Chart Card */}
      <div className="crm-chart-card">
        <div className="crm-chart-card-header">
          <div>
            <h3 className="crm-chart-title">Users</h3>
          </div>
          <div className="crm-chart-summary">
            <span className="crm-chart-summary-label">
              {usersCountMap[usersPeriod].label}
            </span>
            <span className="crm-chart-summary-value">
              {usersCountMap[usersPeriod].value}
            </span>
          </div>
        </div>

        <div className="crm-chart-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={activeUsersData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(val) => [val, "Registered Users"]}
                contentStyle={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                }}
              />
              <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>

          <div className="crm-chart-actions">
            {periods.map((p) => (
              <button
                key={p}
                className={`crm-chart-tab ${usersPeriod === p ? "active" : ""}`}
                onClick={() => setUsersPeriod(p)}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
