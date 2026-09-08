import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../../api/axios";
import "./DriverRidesPage.css";

const filters = [
  { label: "All", value: "all" },
  { label: "Booked", value: "booked" },
  { label: "Ongoing", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function DriverRidesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [rides, setRides] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDriverRides();
    }
  }, [id, filter]);

  async function fetchDriverRides() {
    setLoading(true);
    try {
      const res = await api.get(`/drivers/${id}/rides?status=${filter}`);
      if (res.data && res.data.success) {
        setDriver(res.data.driver || null);
        setRides(res.data.rides || []);
      } else {
        setRides([]);
      }
    } catch (err) {
      console.error("Failed to load driver rides:", err);
      setRides([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredRides = rides.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.userName || "").toLowerCase().includes(q) ||
      (r.userNumber || "").toLowerCase().includes(q) ||
      (r.from || "").toLowerCase().includes(q) ||
      (r.to || "").toLowerCase().includes(q) ||
      (r.fare || "").toLowerCase().includes(q) ||
      (r.distance || "").toLowerCase().includes(q) ||
      (r.status || "").toLowerCase().includes(q) ||
      (r.date || "").toLowerCase().includes(q)
    );
  });

  const getStatusBadgeClass = (status) => {
    if (!status) return "booked";
    const st = status.toLowerCase();
    if (st === "ongoing" || st === "arrived" || st === "in_progress") return "in_progress";
    if (st === "completed") return "completed";
    if (st === "cancelled") return "cancelled";
    return "booked";
  };

  const getStatusLabel = (status) => {
    if (!status) return "Booked";
    const st = status.toLowerCase();
    if (st === "in_progress" || st === "ongoing") return "Ongoing";
    if (st === "arrived") return "Arrived";
    if (st === "completed") return "Completed";
    if (st === "cancelled") return "Cancelled";
    return st.charAt(0).toUpperCase() + st.slice(1);
  };

  return (
    <div className="driverrides-page-wrap">
      <button className="driverrides-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      <div className="driverrides-card">
        <div className="driverrides-card-header">
          <h4>Driver Rides</h4>
          <h4>Driver Name : {driver ? driver.name : (loading ? "Loading..." : "Driver")}</h4>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search rides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "var(--bg-main, #0f172a)",
                border: "1px solid var(--border-color, #334155)",
                color: "var(--text-main, #fff)",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <div className="driverrides-filter-group">
              {filters.map((f) => (
                <label key={f.value}>
                  <input
                    type="radio"
                    name="filter"
                    value={f.value}
                    checked={filter === f.value}
                    onChange={() => setFilter(f.value)}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="driverrides-card-body">
          <div className="driverrides-table-wrap">
            <table className="driverrides-table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>Sr.no</th>
                  <th style={{ width: "90px", textAlign: "center" }}>User Image</th>
                  <th style={{ minWidth: "130px" }}>User Name</th>
                  <th style={{ minWidth: "130px" }}>User Number</th>
                  <th style={{ minWidth: "160px" }}>From Address</th>
                  <th style={{ minWidth: "160px" }}>Destination Address</th>
                  <th style={{ width: "110px", textAlign: "center" }}>Fare</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Distance Km</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Status</th>
                  <th style={{ width: "130px", textAlign: "center" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="driverrides-no-data">
                      Loading rides...
                    </td>
                  </tr>
                ) : filteredRides.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="driverrides-no-data">
                      No rides found
                    </td>
                  </tr>
                ) : (
                  filteredRides.map((r, i) => (
                    <tr key={r.id || r._id || i}>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                      <td style={{ textAlign: "center" }}>
                        <img
                          src={r.userImage || "/no-document.png"}
                          alt={r.userName}
                          className="driverrides-avatar"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(r.userName || "User");
                          }}
                        />
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{r.userName}</span>
                      </td>
                      <td>
                        <span style={{ color: "var(--text-muted, #94a3b8)" }}>{r.userNumber}</span>
                      </td>
                      <td><div className="ride-location-cell">{r.from}</div></td>
                      <td><div className="ride-location-cell">{r.to}</div></td>
                      <td style={{ textAlign: "center" }}>
                        <span className="ride-fare-text" style={{ fontWeight: 700, color: "var(--accent, #fd683e)" }}>{r.fare}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className="ride-dist-text">{r.distance}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`driverrides-status ${getStatusBadgeClass(r.status)}`}>
                          {getStatusLabel(r.status)}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>{r.date}</td>
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