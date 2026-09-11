import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Search, Eye } from "lucide-react";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../../shared/formCard.css";
import "./SubAdminDriversPage.css";

export default function SubAdminDriversPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [subAdmin, setSubAdmin] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Fetch subadmin details
        let regionState = "";
        try {
          const sRes = await api.get(`/subadmins/${id}`);
          if (sRes.data?.subAdmin) {
            setSubAdmin(sRes.data.subAdmin);
            regionState = sRes.data.subAdmin.state || sRes.data.subAdmin.name || "";
          }
        } catch (e) {
          console.warn("Could not fetch subadmin by id:", e.message);
        }

        // Fetch drivers
        const dRes = await api.get("/drivers?limit=100");
        if (dRes.data?.drivers) {
          let list = dRes.data.drivers;
          if (regionState) {
            const matched = list.filter(
              (d) =>
                (d.state && d.state.toLowerCase() === regionState.toLowerCase()) ||
                (d.address && d.address.toLowerCase().includes(regionState.toLowerCase()))
            );
            if (matched.length > 0) {
              list = matched;
            }
          }
          setDrivers(list);
        }
      } catch (err) {
        console.error("Failed to load subadmin drivers:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  const regionName = subAdmin?.state || subAdmin?.name || `Sub-Admin #${id}`;

  const filtered = drivers.filter((d) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const name = (d.name || "").toLowerCase();
    const phone = (d.phone || d.number || "").toLowerCase();
    const vehicle = (d.vehicleNumber || d.vehicle_number || "").toLowerCase();
    return name.includes(q) || phone.includes(q) || vehicle.includes(q);
  });

  return (
    <div className="fc-page-wrap">
      <div className="subadmin-drivers-topbar">
        <button className="fc-back-btn" onClick={() => navigate("/admin/subadmin/see")}>
          <ArrowLeft size={16} />
          <span>Back to Sub-Admins</span>
        </button>
      </div>

      <div className="fc-card">
        <div className="fc-card-header">
          <div className="subadmin-drivers-header-info">
            <div className="subadmin-drivers-header-icon">
              <Car size={20} />
            </div>
            <div>
              <h4 className="fc-card-title">Assigned Drivers — {regionName}</h4>
              <p className="subadmin-drivers-subtitle">
                Viewing registered drivers managed by Sub-Admin {subAdmin?.name ? `"${subAdmin.name}"` : `#${id}`}
                {subAdmin?.state ? ` (${subAdmin.state} Region)` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="fc-card-body">
          <div className="subadmin-drivers-toolbar">
            <div className="subadmin-drivers-search-box">
              <Search size={16} className="subadmin-drivers-search-icon" />
              <input
                type="text"
                placeholder="Search drivers by name, phone or vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="fc-table-wrap">
            <table className="fc-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Driver Profile</th>
                  <th>Driver Name</th>
                  <th>Phone Number</th>
                  <th>Vehicle Info</th>
                  <th>Total Rides</th>
                  <th>Wallet Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="fc-no-data">
                      Loading drivers from database...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="fc-no-data">
                      No assigned drivers found for this region
                    </td>
                  </tr>
                ) : (
                  filtered.map((d, i) => {
                    const driverId = d.id || d._id;
                    const statusText = d.approved || (d.status === 2 || d.status === "2" ? "Approved" : d.status === 3 || d.status === "3" ? "Rejected" : "Pending");
                    return (
                      <tr key={driverId}>
                        <td>{i + 1}</td>
                        <td>
                          <img
                            src={d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Driver")}&background=random`}
                            alt=""
                            className="subadmin-avatar"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || "Driver")}&background=random`;
                            }}
                          />
                        </td>
                        <td style={{ fontWeight: 600 }}>{d.name} {d.lastName || d.last_name || ""}</td>
                        <td>{d.phone || d.number || "N/A"}</td>
                        <td>{d.vehicleNumber || d.vehicle_number || "N/A"} ({d.brand || d.vehicleBrand || "Cab"})</td>
                        <td>{d.totalRides ?? 0}</td>
                        <td style={{ color: "var(--accent)", fontWeight: 600 }}>₹ {Number(d.wallet || 0).toFixed(2)}</td>
                        <td>
                          <span
                            className="subadmin-status-badge"
                            style={{
                              background:
                                statusText === "Approved"
                                  ? "#22c55e"
                                  : statusText === "Rejected"
                                  ? "#ef4444"
                                  : "#f59e0b",
                              color: "#fff",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 700,
                            }}
                          >
                            {statusText}
                          </span>
                        </td>
                        <td>
                          <button
                            className="fc-icon-btn edit"
                            title="View Driver Profile"
                            onClick={() => navigate(`/admin/driver/profile/${driverId}`)}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={1}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
