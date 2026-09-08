import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, ArrowLeft, Search, Users } from "lucide-react";
import api from "../../../../api/axios";
import "../driverTable.css";

export default function ActiveDriversStateCountPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [stateCounts, setStateCounts] = useState([]);
  const [totalActive, setTotalActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStateCounts(activeSearch);
  }, []);

  async function fetchStateCounts(query = activeSearch) {
    setLoading(true);
    try {
      let url = "/drivers/active/state-count";
      if (query && query.trim()) {
        url += `?search=${encodeURIComponent(query.trim())}`;
      }
      const res = await api.get(url);
      if (res.data && res.data.stateCounts) {
        setStateCounts(res.data.stateCounts);
        setTotalActive(res.data.totalActive || 0);
      }
    } catch (err) {
      console.error("Failed to load active drivers by state:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveSearch(searchInput);
    fetchStateCounts(searchInput);
  }

  function handleReload() {
    setSearchInput("");
    setActiveSearch("");
    fetchStateCounts("");
  }

  function handleViewDrivers(state) {
    navigate(`/admin/drivers/active-state-count/${encodeURIComponent(state)}`);
  }

  return (
    <div className="driver-page-container">
      {/* Topbar Back Navigation */}
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/drivers/manage")}
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
          <span>Back to Manage Drivers</span>
        </button>
      </div>

      {/* Header Row */}
      <div className="driver-header-row">
        <h1 className="driver-main-title">Active Driver State Wise Count</h1>
      </div>

      {/* Controls Toolbar with Total Active Driver next to Reload button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search State..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="driver-standalone-search-input"
          />
          <button type="submit" className="driver-btn-rounded-primary">
            <Search size={15} />
            Search
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div
            className="driver-stat-pill"
            style={{
              backgroundColor: "#ff4d58",
              fontSize: "13px",
              padding: "7px 18px",
              fontWeight: 700,
              boxShadow: "0 2px 6px rgba(255, 77, 88, 0.3)",
            }}
          >
            Total Active Driver : {totalActive}
          </div>

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
      </div>

      {/* Table Card Wrap */}
      <div className="driver-card-wrap">
        <div className="driver-table-responsive">
          <table className="driver-custom-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Sr.no</th>
                <th>State / Region</th>
                <th style={{ textAlign: "center", width: "220px" }}>Total Active Count</th>
                <th style={{ textAlign: "center", width: "160px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="driver-no-data-cell">
                    Loading state-wise counts...
                  </td>
                </tr>
              ) : stateCounts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="driver-no-data-cell">
                    No states found
                  </td>
                </tr>
              ) : (
                stateCounts.map((row, index) => (
                  <tr key={row.state || index}>
                    <td>{index + 1}</td>
                    <td>
                      <strong style={{ fontSize: "14px" }}>{row.state}</strong>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          background: "#ff4d58",
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: "13px",
                          padding: "4px 14px",
                          borderRadius: "16px",
                          minWidth: "42px",
                        }}
                      >
                        {row.count}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleViewDrivers(row.state)}
                        style={{
                          background: "#ff4d58",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "20px",
                          padding: "6px 18px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 6px rgba(255, 77, 88, 0.3)",
                        }}
                      >
                        <Users size={13} />
                        View Drivers
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
