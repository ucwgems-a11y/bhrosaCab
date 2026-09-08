import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import api from "../../../api/axios";
import "./CrmDriverReferral.css";

export default function CrmDriverReferralList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driverInfo, setDriverInfo] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, [id]);

  async function fetchReferrals() {
    setLoading(true);
    try {
      const res = await api.get(`/drivers/${id}/referrals`);
      if (res.data) {
        setDriverInfo(res.data.driver || null);
        setReferrals(res.data.referrals || []);
      }
    } catch (err) {
      console.error("Failed to load driver referrals:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="crm-referral-page-wrap">
      {/* Top Header */}
      <div className="crm-referral-top-header">
        <h6 className="crm-referral-top-title">Driver Referral List</h6>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="crm-referral-back-btn"
            onClick={fetchReferrals}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Reload
          </button>
          <button
            type="button"
            className="crm-referral-back-btn"
            onClick={() => navigate(`/crm-driver-profile/${id}`)}
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="crm-referral-summary-grid">
        <div className="crm-referral-summary-card">
          <h6 className="crm-referral-summary-label">Referral Driver</h6>
          <h4 className="crm-referral-summary-value">
            {driverInfo ? driverInfo.name : "Loading..."}
          </h4>
        </div>

        <div className="crm-referral-summary-card">
          <h6 className="crm-referral-summary-label">Referral Code</h6>
          <h4 className="crm-referral-summary-value">
            {driverInfo ? driverInfo.referalCode : "..."}
          </h4>
        </div>

        <div className="crm-referral-summary-card">
          <h6 className="crm-referral-summary-label">Total Referred Drivers</h6>
          <h4 className="crm-referral-summary-value text-success">
            {referrals.length}
          </h4>
        </div>
      </div>

      {/* Table Card */}
      <div className="crm-referral-main-card">
        <div className="crm-referral-card-header">
          <h4 className="crm-referral-card-title">Driver Referral List</h4>
        </div>

        <div className="crm-referral-card-body">
          <div className="crm-referral-table-wrap">
            <table className="crm-referral-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Driver Image</th>
                  <th>Driver Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>State</th>
                  <th>Status</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="crm-referral-no-data" style={{ color: "var(--text-muted)" }}>
                      Loading referrals...
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="crm-referral-no-data">
                      No referred drivers found for this referral code.
                    </td>
                  </tr>
                ) : (
                  referrals.map((r, i) => (
                    <tr key={r.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <img
                          src={r.image}
                          alt=""
                          style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || "Driver")}&background=0D8ABC&color=fff`;
                          }}
                        />
                      </td>
                      <td><strong>{r.name}</strong></td>
                      <td>{r.email}</td>
                      <td>{r.phone}</td>
                      <td>{r.state}</td>
                      <td>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background:
                              String(r.status).toLowerCase() === "approved" || String(r.status).toLowerCase() === "active"
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(239, 68, 68, 0.15)",
                            color:
                              String(r.status).toLowerCase() === "approved" || String(r.status).toLowerCase() === "active"
                                ? "#10b981"
                                : "#ef4444",
                          }}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td>{r.date}</td>
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
