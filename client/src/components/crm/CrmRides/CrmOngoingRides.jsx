import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
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

export default function CrmOngoingRides() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = useCallback(async (q = query) => {
    try {
      setLoading(true);
      const res = await api.get(`/rides?status=ongoing&search=${encodeURIComponent(q)}`);
      if (res.data && res.data.success) {
        setRides(res.data.rides || []);
      }
    } catch (err) {
      console.error("Error fetching CRM ongoing rides:", err);
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

  return (
    <div className="ride-page-wrap">
      <div className="ride-card">
        <div className="ride-card-header">
          <h4 className="ride-card-title">Ongoing Rides</h4>
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
                Total Ongoing : {rides.length}
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
                  <th style={{ width: "140px", textAlign: "center" }}>Waiting Charges</th>
                  <th style={{ width: "100px", textAlign: "center" }}>Ride Fare</th>
                  <th style={{ width: "100px", textAlign: "center" }}>Total Fare</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={12} className="ride-no-data">
                      Loading ongoing rides...
                    </td>
                  </tr>
                ) : rides.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="ride-no-data">
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
                        <span className="ride-waiting-charge">{r.waitingCharges}</span>
                      </td>
                      <td>
                        <span className="ride-fare-text">{r.rideFare}</span>
                      </td>
                      <td>
                        <span className="ride-total-fare-text">{r.totalFare}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="ride-badge ride-badge-ongoing">Ongoing</span>
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