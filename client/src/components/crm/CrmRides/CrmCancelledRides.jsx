import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";
import "./CrmRides.css";

const resolveImageUrl = (img, name) => {
  if (!img || img === "/no-document.png") {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`;
  }
  if (img.startsWith("http://") || img.startsWith("https://")) {
    return img;
  }
  const clean = img.startsWith("/") ? img.substring(1) : img;
  return `${SERVER_URL}/${clean}`;
};

export default function CrmCancelledRides() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = useCallback(async (q = query) => {
    try {
      setLoading(true);
      const res = await api.get(`/rides?status=cancelled&search=${encodeURIComponent(q)}`);
      if (res.data && res.data.success) {
        setRides(res.data.rides || []);
      }
    } catch (err) {
      console.error("Error fetching CRM cancelled rides:", err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchRides();
  }, [fetchRides]);

  function handleSearch(e) {
    e.preventDefault();
    setQuery(search);
  }

  function handleReload() {
    setSearch("");
    setQuery("");
    fetchRides("");
  }

  function handleViewReason(r) {
    Swal.fire({
      title: "Cancellation Reason",
      html:
        '<div style="text-align: left; padding: 10px; font-size: 14px; color: #334155;">' +
        '<p><strong>User:</strong> ' + r.userName + '</p>' +
        '<p><strong>Driver:</strong> ' + r.driverName + '</p>' +
        '<p><strong>Route:</strong> ' + r.from + ' ➔ ' + r.to + '</p>' +
        '<hr style="margin: 10px 0; border: 0; border-top: 1px solid #e2e8f0;"/>' +
        '<p style="color: #ef4444; font-weight: 600;"><strong>Reason:</strong> ' +
        (r.reason || "No reason provided") +
        '</p>' +
        '</div>',
      icon: "info",
      confirmButtonText: "Close",
      confirmButtonColor: "#ff6438",
    });
  }

  return (
    <div className="ride-page-wrap">
      <div className="ride-card">
        <div className="ride-card-header">
          <h4 className="ride-card-title">Cancelled Rides</h4>
        </div>

        <div className="ride-card-body">
          <div className="ride-toolbar-row">
            <form className="ride-search-form" onSubmit={handleSearch}>
              <div className="ride-input-group">
                <input
                  type="text"
                  placeholder="Search user, driver..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="ride-search-btn">
                  Search
                </button>
              </div>
              <div className="ride-total-text">
                Total Cancelled : {rides.length}
              </div>
            </form>

            <button className="ride-reload-btn" onClick={handleReload} disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Reload</span>
            </button>
          </div>

          <div className="ride-table-responsive">
            <table className="ride-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>#</th>
                  <th style={{ width: "150px", textAlign: "center" }}>User</th>
                  <th style={{ width: "160px", textAlign: "center" }}>Driver</th>
                  <th style={{ width: "150px", textAlign: "center" }}>Vehicle</th>
                  <th>From</th>
                  <th>To</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Distance</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Total Fare</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Reason</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="ride-no-data">
                      Loading cancelled rides...
                    </td>
                  </tr>
                ) : rides.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="ride-no-data">
                      No rides found
                    </td>
                  </tr>
                ) : (
                  rides.map((r, i) => (
                    <tr key={r.id || i}>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{r.srNo || i + 1}</td>
                      <td>
                        <div className="ride-user-cell">
                          <img
                            src={resolveImageUrl(r.userImage, r.userName)}
                            alt={r.userName}
                            className="ride-user-avatar"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName || "User")}&background=random`;
                            }}
                          />
                          <span className="ride-user-name">{r.userName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ride-driver-cell">
                          <span className="ride-driver-name">{r.driverName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ride-vehicle-cell">
                          <span className="ride-vehicle-name">{r.vehicleName}</span>
                          <span className="ride-vehicle-rate">{r.vehicleRate}</span>
                        </div>
                      </td>
                      <td>
                        <div className="ride-location-cell" title={r.from}>
                          {r.from}
                        </div>
                      </td>
                      <td>
                        <div className="ride-location-cell" title={r.to}>
                          {r.to}
                        </div>
                      </td>
                      <td>
                        <span className="ride-dist-text">{r.distance}</span>
                      </td>
                      <td>
                        <span className="ride-total-fare-text">{r.totalFare}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="ride-badge ride-badge-cancelled">Cancelled</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="ride-reason-btn"
                          onClick={() => handleViewReason(r)}
                        >
                          Reason
                        </button>
                      </td>
                      <td>
                        <div className="ride-date-cell">
                          <span className="ride-date-day">{r.date}</span>
                          <span className="ride-date-time">{r.time}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}