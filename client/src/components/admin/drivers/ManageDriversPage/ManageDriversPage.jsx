import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Eye, Power, Search } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../driverTable.css";

export default function ManageDriversPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // "" | "2" (Approved) | "1" (Pending) | "3" (Rejected)
  const [drivers, setDrivers] = useState([]);
  const [statsData, setStatsData] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
    todayNC: 0,
    totalNC: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchDrivers(1, activeSearch, activeFilter);
  }, [activeFilter]);

  async function fetchDrivers(page = 1, query = activeSearch, statusFilter = activeFilter) {
    setLoading(true);
    try {
      let url = `/drivers?page=${page}&limit=20`;
      if (query && query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;
      if (statusFilter) url += `&status=${encodeURIComponent(statusFilter)}`;

      const res = await api.get(url);
      if (res.data && res.data.drivers) {
        setDrivers(res.data.drivers);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        setTotalRecords(res.data.total || res.data.drivers.length);
        if (res.data.stats) {
          setStatsData({
            total: res.data.stats.total || 0,
            today: res.data.stats.today || 0,
            thisWeek: res.data.stats.thisWeek || 0,
            thisMonth: res.data.stats.thisMonth || 0,
            thisYear: res.data.stats.thisYear || 0,
            todayNC: res.data.stats.todayNC || 0,
            totalNC: res.data.stats.totalNC || 0,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load drivers:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveSearch(searchInput);
    fetchDrivers(1, searchInput, activeFilter);
  }

  function handleReload() {
    setSearchInput("");
    setActiveSearch("");
    setActiveFilter("");
    fetchDrivers(1, "", "");
  }

  function handleFilterClick(statusCode) {
    setActiveFilter((prev) => (prev === statusCode ? "" : statusCode));
  }

  function handleView(id) {
    navigate(`/admin/drivers/profile/${id}`);
  }

  function handleToggleBlock(id, isBlocked) {
    const actionText = isBlocked ? "unblock" : "block";

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: `You want to ${actionText} this driver?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: `Yes, ${actionText}!`,
        cancelButtonText: "No, cancel",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.put(`/drivers/${id}/block`);
            showSuccessAlert(`Driver ${isBlocked ? "unblocked" : "blocked"} successfully!`);
            fetchDrivers(currentPage, activeSearch, activeFilter);
          } catch (err) {
            console.error("Failed to toggle block status:", err);
            showErrorAlert("Failed to update block status");
          }
        }
      });
  }

  function handleForceLogout(id, driverName) {
    swalWithBootstrapButtons
      .fire({
        title: "Logout Driver?",
        text: `Are you sure you want to force logout ${driverName || "this driver"} from all devices?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout driver!",
        cancelButtonText: "No, cancel",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            const res = await api.post(`/drivers/${id}/logout`);
            showSuccessAlert(res.data.message || "Driver logged out successfully from all devices!");
            fetchDrivers(currentPage, activeSearch, activeFilter);
          } catch (err) {
            console.error("Failed to logout driver:", err);
            showErrorAlert(err.response?.data?.message || "Failed to logout driver");
          }
        }
      });
  }

  const statPills = [
    { label: `Total : ${statsData.total}`, bg: "#ff4d58" },
    { label: `Today : ${statsData.today}`, bg: "#22c55e" },
    { label: `This Week : ${statsData.thisWeek}`, bg: "#a855f7" },
    { label: `This Month : ${statsData.thisMonth}`, bg: "#f59e0b" },
    { label: `This Year : ${statsData.thisYear}`, bg: "#e11d48" },
    { label: `Today N/C : ${statsData.todayNC}`, bg: "#64748b" },
    { label: `Total N/C : ${statsData.totalNC}`, bg: "#6366f1" },
  ];

  return (
    <div className="driver-page-container">
      {/* 1. Header: Title & Dynamic Stat Pills */}
      <div className="driver-header-row">
        <h1 className="driver-main-title">Manage Driver</h1>
        <div className="driver-stat-pills-row">
          {statPills.map((s, i) => (
            <div
              key={i}
              className="driver-stat-pill"
              style={{ backgroundColor: s.bg }}
            >
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Controls Toolbar: Search & Action Buttons */}
      <div className="driver-toolbar-row">
        <form onSubmit={handleSearchSubmit} className="driver-search-group">
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="driver-search-input"
          />
          <button type="submit" className="driver-search-btn">
            Search
          </button>
        </form>

        <div className="driver-filter-pills-row">
          <button
            type="button"
            className="driver-filter-btn reload"
            onClick={handleReload}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            Reload
          </button>
          <button
            type="button"
            className="driver-filter-btn approved"
            onClick={() => handleFilterClick("2")}
            style={{ opacity: activeFilter === "2" || !activeFilter ? 1 : 0.6 }}
          >
            Approved
          </button>
          <button
            type="button"
            className="driver-filter-btn pending"
            onClick={() => handleFilterClick("1")}
            style={{ opacity: activeFilter === "1" || !activeFilter ? 1 : 0.6 }}
          >
            Pending
          </button>
          <button
            type="button"
            className="driver-filter-btn rejected"
            onClick={() => handleFilterClick("3")}
            style={{ opacity: activeFilter === "3" || !activeFilter ? 1 : 0.6 }}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* 3. Table Card Wrap */}
      <div className="driver-card-wrap">
        <div className="driver-table-responsive">
          <table className="driver-custom-table">
            <thead>
              <tr>
                <th>Sr.no</th>
                <th>Driver Image</th>
                <th>Name</th>
                <th>Vehicle Number</th>
                <th>Email</th>
                <th>Phone no.</th>
                <th>Active Status</th>
                <th>Block Status</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="driver-no-data-cell">
                    Loading drivers...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="driver-no-data-cell">
                    No drivers found
                  </td>
                </tr>
              ) : (
                drivers.map((d, index) => (
                  <tr key={d.id || d._id}>
                    <td>{(currentPage - 1) * 20 + index + 1}</td>
                    <td>
                      <img
                        src={d.image}
                        alt={d.name}
                        className="driver-avatar-img"
                        onError={(e) => {
                          e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(d.name);
                        }}
                      />
                    </td>
                    <td>{d.name}</td>
                    <td>{d.vehicleNumber}</td>
                    <td>{d.email}</td>
                    <td>{d.phone}</td>
                    <td>
                      <span
                        className={
                          d.active === "Online"
                            ? "driver-status-text online"
                            : "driver-status-text offline"
                        }
                      >
                        {d.active}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={
                          d.blocked
                            ? "driver-block-pill-btn unblock"
                            : "driver-block-pill-btn"
                        }
                        onClick={() => handleToggleBlock(d.id || d._id, d.blocked)}
                      >
                        {d.blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                    <td>
                      <span
                        className={
                          d.approved === "Approved"
                            ? "driver-status-text approved"
                            : d.approved === "Rejected"
                            ? "driver-status-text rejected"
                            : "driver-status-text pending"
                        }
                      >
                        {d.approved}
                      </span>
                    </td>
                    <td>
                      <div className="driver-action-icons-wrap">
                        <button
                          type="button"
                          className="driver-circle-btn view"
                          onClick={() => handleView(d.id || d._id)}
                          title="View Profile"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="driver-circle-btn power"
                          onClick={() => handleForceLogout(d.id || d._id, d.name)}
                          title="Force Logout Driver"
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 4px" }}>
        <span style={{ color: "var(--text-muted, #94a3b8)", fontSize: "13px" }}>
          Showing {drivers.length} of {totalRecords} records (Page {currentPage} of {totalPages})
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => fetchDrivers(p, activeSearch, activeFilter)}
        />
      </div>
    </div>
  );
}
