import { useState, useRef, useEffect } from "react";
import { Bike, Car, Pencil, Check } from "lucide-react";
import StatCard from "./StatCard/StatCard";
import FareCard from "./FareCard/FareCard";
import ChartsSection from "./ChartsSection/ChartsSection";
import NewUsersList from "./NewUsersList/NewUsersList";
import api from "../../../api/axios";

import "./Dashboard.css";
import { showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";

const initialRideStats = [
  { label: "Ongoing Rides", value: "0" },
  { label: "Completed Rides", value: "0" },
  { label: "Cancelled Rides", value: "0" },
];

function getVehicleIcon(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("bike") || lower.includes("motorcycle")) {
    return <Bike size={18} />;
  }
  return <Car size={18} />;
}

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const [fareCards, setFareCards] = useState([]);
  const [rideStatsList, setRideStatsList] = useState(initialRideStats);
  const [loading, setLoading] = useState(true);

  // Live analytics data for charts and recent users
  const [earningsAnalytics, setEarningsAnalytics] = useState(null);
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  const [recentUsersList, setRecentUsersList] = useState([]);

  // Minimum driver wallet amount — editable with MongoDB persistence
  const [minWallet, setMinWallet] = useState(() => {
    return localStorage.getItem("minDriverWallet") || "10";
  });
  const [editingWallet, setEditingWallet] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [savingWallet, setSavingWallet] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    async function fetchDashboardAnalytics() {
      setLoading(true);
      try {
        const res = await api.get("/dashboard/analytics");
        if (res.data && res.data.success) {
          const { stats, earnings, usersData, fareCards: fares, recentUsers } = res.data;

          if (stats) {
            setTotalUsers(stats.totalUsers || 0);
            setTotalDrivers(stats.totalDrivers || 0);
            setRideStatsList([
              { label: "Ongoing Rides", value: String(stats.totalOngoing || 0) },
              { label: "Completed Rides", value: String(stats.totalCompleted || 0) },
              { label: "Cancelled Rides", value: String(stats.totalCancelled || 0) },
            ]);
            if (stats.minDriverWallet) {
              setMinWallet(String(stats.minDriverWallet));
              localStorage.setItem("minDriverWallet", String(stats.minDriverWallet));
            }
          }

          if (fares) setFareCards(fares);
          if (earnings) setEarningsAnalytics(earnings);
          if (usersData) setUsersAnalytics(usersData);
          if (recentUsers) setRecentUsersList(recentUsers);
        }
      } catch (err) {
        console.error("Failed to fetch live dashboard analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardAnalytics();
  }, []);

  useEffect(() => {
    if (editingWallet && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingWallet]);

  function handleStartEditing() {
    setEditingWallet(true);
  }

  async function saveMinWallet() {
    if (!minWallet.trim()) return;
    setSavingWallet(true);
    try {
      await api.post("/dashboard/min-wallet", { amount: minWallet.trim() });
      localStorage.setItem("minDriverWallet", minWallet.trim());
      setEditingWallet(false);
      setJustSaved(true);
      showSuccessAlert("Minimum driver wallet amount updated!", 1200);
      setTimeout(() => {
        setJustSaved(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to update min driver wallet:", err);
      showErrorAlert("Failed to save minimum wallet amount");
    } finally {
      setSavingWallet(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveMinWallet();
    } else if (e.key === "Escape") {
      setEditingWallet(false);
    }
  }

  const summaryStats = [
    { label: "Total Users", value: totalUsers.toString() },
    { label: "Total Drivers", value: totalDrivers.toString() },
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Dashboard</h1>

      {/* ============ Row 1: wallet amount + user/driver totals ============ */}
      <div className="dashboard-grid">
        <div className={`wallet-card ${editingWallet ? "is-editing" : ""}`}>
          <div className="wallet-card-label">Minimum Driver Wallet Amount ₹</div>
          <div className="wallet-card-row">
            <input
              ref={inputRef}
              type="number"
              min="0"
              step="1"
              value={minWallet}
              onChange={(e) => setMinWallet(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!editingWallet || savingWallet}
              placeholder="Enter amount"
              className={editingWallet ? "editable-active" : ""}
            />
            {editingWallet ? (
              <button
                type="button"
                className="wallet-edit-btn update-mode"
                onClick={saveMinWallet}
                disabled={savingWallet}
                title="Click to update wallet amount"
              >
                {savingWallet ? "Saving..." : "Update"}
              </button>
            ) : (
              <button
                type="button"
                className={`wallet-edit-btn ${justSaved ? "saved-mode" : ""}`}
                onClick={handleStartEditing}
                title={justSaved ? "Saved" : "Click to edit"}
              >
                {justSaved ? <Check size={16} /> : <Pencil size={16} />}
              </button>
            )}
          </div>
        </div>

        {summaryStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* ============ Row 2: ride status counters ============ */}
      <div className="dashboard-grid" style={{ marginTop: 16 }}>
        {rideStatsList.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      {/* ============ Row 3: fare per km cards ============ */}
      <div className="fare-grid" style={{ marginTop: 16 }}>
        {fareCards.length > 0 ? (
          fareCards.map((f) => (
            <FareCard
              key={f.id || f._id}
              icon={getVehicleIcon(f.vehicleTypeName)}
              label={f.vehicleTypeName || "Vehicle"}
              price={f.rawFarePerKm || f.farePerKm}
            />
          ))
        ) : loading ? (
          <div style={{ color: "var(--text-muted, #94a3b8)", fontSize: "14px", padding: "10px" }}>
            Loading vehicle fares...
          </div>
        ) : null}
      </div>

      {/* ============ Row 4: dynamic earnings + users charts ============ */}
      <div style={{ marginTop: 24 }}>
        <ChartsSection earningsDataProps={earningsAnalytics} usersDataProps={usersAnalytics} />
      </div>

      {/* ============ Row 5: newest registered users ============ */}
      <NewUsersList initialUsers={recentUsersList} />
    </div>
  );
}
