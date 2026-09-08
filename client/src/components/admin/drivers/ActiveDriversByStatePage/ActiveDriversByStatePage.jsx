import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Eye, Power, Search } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../driverTable.css";

export default function ActiveDriversByStatePage() {
  const { state } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchDrivers(1, activeSearch);
  }, [state]);

  async function fetchDrivers(page = 1, query = activeSearch) {
    setLoading(true);
    try {
      let url = `/drivers?active_status=1&state=${encodeURIComponent(state)}&page=${page}&limit=20`;
      if (query && query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;

      const res = await api.get(url);
      if (res.data && res.data.drivers) {
        setDrivers(res.data.drivers);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        setTotalRecords(res.data.total || res.data.drivers.length);
      }
    } catch (err) {
      console.error("Failed to load drivers for state:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveSearch(searchInput);
    fetchDrivers(1, searchInput);
  }

  function handleReload() {
    setSearchInput("");
    setActiveSearch("");
    fetchDrivers(1, "");
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
            fetchDrivers(currentPage, activeSearch);
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
            showSuccessAlert(res.data?.message || "Driver logged out successfully from all devices!");
            fetchDrivers(currentPage, activeSearch);
          } catch (err) {
            console.error("Failed to logout driver:", err);
            showErrorAlert(err.response?.data?.message || "Failed to logout driver");
          }
        }
      });
  }

  return (
    <div className="driver-page-container">
      {/* Back button */}
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/drivers/active-state-count")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card, #1a222d)",
            color: "var(--text-primary, #fff)",
            border: "1px solid var(--border-color, #2a3441)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to State Counts</span>
        </button>
      </div>

      <div className="driver-header-row">
        <h1 className="driver-main-title">
          Active Drivers in <span style={{ color: "var(--accent, #fd683e)" }}>{state}</span>
        </h1>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search drivers in state..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="driver-standalone-search-input"
          />
          <button type="submit" className="driver-btn-rounded-primary">
            <Search size={15} />
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={handleReload}
          disabled={loading}
          className="driver-filter-btn reload"
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Reload
        </button>
      </div>

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
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="driver-no-data-cell">
                    Loading drivers...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="driver-no-data-cell">
                    No drivers found in {state}
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 4px" }}>
        <span style={{ color: "var(--text-muted, #94a3b8)", fontSize: "13px" }}>
          Showing {drivers.length} of {totalRecords} records (Page {currentPage} of {totalPages})
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => fetchDrivers(p, activeSearch)}
        />
      </div>
    </div>
  );
}
