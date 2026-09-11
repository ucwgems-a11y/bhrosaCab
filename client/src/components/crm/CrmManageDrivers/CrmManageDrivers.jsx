import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Eye, Edit, MapPin } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import Pagination from "../../admin/rides/Pagination/Pagination";
import api from "../../../api/axios";
import "./CrmManageDrivers.css";

export default function CrmManageDrivers() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(""); // "" | "2" (Approved) | "1" (Pending) | "3" (Rejected)
  const [drivers, setDrivers] = useState([]);
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
      }
    } catch (err) {
      console.error("Failed to load CRM drivers:", err);
      showErrorAlert("Failed to load drivers from database");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
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

  function handleBlockToggle(id, isBlocked) {
    const actionText = isBlocked ? "unblock" : "block";

    swalWithBootstrapButtons
      .fire({
        title: "Change Block Status?",
        text: `Are you sure you want to ${actionText} this driver?`,
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

  function handleView(id) {
    navigate(`/crm-driver-profile/${id}`);
  }

  function handleEdit(id) {
    navigate(`/crm-driver-profile-edit/${id}`);
  }

  function handleLocation(id) {
    navigate(`/crm-driver-location/${id}`);
  }

  return (
    <div className="crm-managedrivers-page-wrap">
      <div className="crm-managedrivers-card">
        <div className="crm-managedrivers-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h4 className="crm-managedrivers-card-title">
            Manage Driver {totalRecords > 0 && <span style={{ fontSize: "14px", fontWeight: "normal", color: "var(--text-muted)" }}>({totalRecords} Total Drivers)</span>}
          </h4>

          {/* Quick Filter Buttons */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setActiveFilter("")}
              style={{
                background: activeFilter === "" ? "var(--accent, #fca103)" : "var(--bg-panel, #242935)",
                color: activeFilter === "" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("2")}
              style={{
                background: activeFilter === "2" ? "#22c55e" : "var(--bg-panel, #242935)",
                color: activeFilter === "2" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Approved
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("1")}
              style={{
                background: activeFilter === "1" ? "#f59e0b" : "var(--bg-panel, #242935)",
                color: activeFilter === "1" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("3")}
              style={{
                background: activeFilter === "3" ? "#ef4444" : "var(--bg-panel, #242935)",
                color: activeFilter === "3" ? "#fff" : "var(--text-primary)",
                border: "1px solid var(--border-color)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Rejected
            </button>
          </div>
        </div>

        <div className="crm-managedrivers-card-body">
          {/* Top Filter Bar */}
          <div className="crm-managedrivers-filter-bar">
            <form className="crm-managedrivers-search-form" onSubmit={handleSearch}>
              <div className="crm-managedrivers-input-group">
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or vehicle..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="crm-managedrivers-search-btn">
                  <Search size={14} /> Search
                </button>
              </div>
            </form>

            <button
              type="button"
              className="crm-managedrivers-reload-btn"
              onClick={handleReload}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Reload</span>
            </button>
          </div>

          {/* Table */}
          <div className="crm-managedrivers-table-wrap">
            <table className="crm-managedrivers-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>Sr.no</th>
                  <th>Driver Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone no.</th>
                  <th>Vehicle</th>
                  <th style={{ textAlign: "center" }}>Active Status</th>
                  <th style={{ textAlign: "center" }}>Block Status</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ width: "130px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="crm-managedrivers-no-data">
                      Loading live drivers from database...
                    </td>
                  </tr>
                ) : drivers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="crm-managedrivers-no-data">
                      No drivers found in database
                    </td>
                  </tr>
                ) : (
                  drivers.map((d, i) => {
                    const driverId = d.id || d._id;
                    const isOnline = d.active === "Online" || d.online_offline === "1" || d.online_offline === 1;
                    const isBlocked = d.blocked || d.is_block === "1" || d.is_block === 1;
                    const statusText = d.approved || (d.status === 2 || d.status === "2" ? "Approved" : d.status === 3 || d.status === "3" ? "Rejected" : "Pending");

                    return (
                      <tr key={driverId}>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>
                          {(currentPage - 1) * 20 + i + 1}
                        </td>
                        <td>
                          <div className="crm-driver-avatar-wrap">
                            <img
                              src={d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Driver")}&background=random`}
                              alt={d.name}
                              className="crm-driver-avatar"
                              onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Driver")}&background=random`;
                              }}
                            />
                          </div>
                        </td>
                        <td className="crm-driver-name">
                          {d.name} {d.lastName || d.last_name || ""}
                        </td>
                        <td className="crm-driver-email">{d.email || "N/A"}</td>
                        <td className="crm-driver-phone">{d.phone || d.number || "N/A"}</td>
                        <td>{d.vehicleNumber || "N/A"}</td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`crm-driver-active-badge ${isOnline ? "online" : "offline"}`}>
                            {isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className={`crm-driver-block-btn ${isBlocked ? "unblock" : "block"}`}
                            onClick={() => handleBlockToggle(driverId, isBlocked)}
                          >
                            {isBlocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "13px",
                              color:
                                statusText === "Approved"
                                  ? "#22c55e"
                                  : statusText === "Rejected"
                                  ? "#ef4444"
                                  : "#f59e0b",
                            }}
                          >
                            {statusText}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                            <button
                              type="button"
                              className="crm-driver-action-eye-btn"
                              title="View Driver Profile"
                              onClick={() => handleView(driverId)}
                            >
                              <Eye size={15} strokeWidth={2.5} />
                            </button>
                            <button
                              type="button"
                              title="Edit Driver"
                              onClick={() => handleEdit(driverId)}
                              style={{
                                background: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                width: "32px",
                                height: "32px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              title="View Live Location"
                              onClick={() => handleLocation(driverId)}
                              style={{
                                background: "#10b981",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                width: "32px",
                                height: "32px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <MapPin size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setCurrentPage(p);
                fetchDrivers(p, activeSearch, activeFilter);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
