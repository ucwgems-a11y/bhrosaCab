import { useState, useEffect } from "react";
import { Bike, Car } from "lucide-react";
import CrmStatCard from "./CrmStatCard/CrmStatCard";
import CrmFareCard from "./CrmFareCard/CrmFareCard";
import CrmChartsSection from "./CrmChartsSection/CrmChartsSection";
import CrmNewUsersList from "./CrmNewUsersList/CrmNewUsersList";
import api from "../../../api/axios";
import "./CrmDashboard.css";

function getVehicleIcon(name = "") {
  const lower = name.toLowerCase();
  if (lower.includes("bike") || lower.includes("motorcycle")) {
    return <Bike size={18} />;
  }
  return <Car size={18} />;
}

export default function CrmDashboard() {
  const [statCards, setStatCards] = useState([
    { label: "Total Users", value: "0", to: "/crm-user" },
    { label: "Total Drivers", value: "0", to: "/crm-user-driver" },
    { label: "Ongoing Rides", value: "0", to: "/crm-rides-ongoing-manage" },
    { label: "Completed Rides", value: "0", to: "/crm-rides-completed-manage" },
    { label: "Cancelled Rides", value: "0", to: "/crm-rides-cancel-manage" },
  ]);
  const [fareCards, setFareCards] = useState([]);
  const [earningsAnalytics, setEarningsAnalytics] = useState(null);
  const [usersAnalytics, setUsersAnalytics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCrmAnalytics() {
      setLoading(true);
      try {
        const res = await api.get("/dashboard/analytics");
        if (res.data && res.data.success) {
          const { stats, earnings, usersData, fareCards: fares, recentUsers: recUsers } = res.data;

          if (stats) {
            setStatCards([
              { label: "Total Users", value: String(stats.totalUsers || 0), to: "/crm-user" },
              { label: "Total Drivers", value: String(stats.totalDrivers || 0), to: "/crm-user-driver" },
              { label: "Ongoing Rides", value: String(stats.totalOngoing || 0), to: "/crm-rides-ongoing-manage" },
              { label: "Completed Rides", value: String(stats.totalCompleted || 0), to: "/crm-rides-completed-manage" },
              { label: "Cancelled Rides", value: String(stats.totalCancelled || 0), to: "/crm-rides-cancel-manage" },
            ]);
          }

          if (fares) setFareCards(fares);
          if (earnings) setEarningsAnalytics(earnings);
          if (usersData) setUsersAnalytics(usersData);
          if (recUsers) setRecentUsers(recUsers);
        }
      } catch (err) {
        console.error("Failed to fetch CRM dashboard analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCrmAnalytics();
  }, []);

  return (
    <div className="crm-dashboard-wrap">
      <div className="crm-dashboard-header">
        <h2 className="crm-dashboard-heading">Dashboard</h2>
      </div>

      {/* Grid of Stat & Fare Cards */}
      <div className="crm-cards-grid">
        {statCards.map((card) => (
          <CrmStatCard
            key={card.label}
            label={card.label}
            value={card.value}
            to={card.to}
          />
        ))}

        {fareCards.map((fare) => (
          <CrmFareCard
            key={fare.id || fare._id || fare.label}
            icon={getVehicleIcon(fare.vehicleTypeName)}
            label={fare.vehicleTypeName}
            priceText={fare.priceText || fare.farePerKm}
          />
        ))}
      </div>

      {/* Earning & Users Charts */}
      <CrmChartsSection earningsDataProps={earningsAnalytics} usersDataProps={usersAnalytics} />

      {/* New Users List */}
      <CrmNewUsersList users={recentUsers} loading={loading} />
    </div>
  );
}
