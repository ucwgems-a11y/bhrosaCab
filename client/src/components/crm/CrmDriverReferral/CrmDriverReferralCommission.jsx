import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import api from "../../../api/axios";
import "./CrmDriverReferral.css";

export default function CrmDriverReferralCommission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    referralDriver: "Loading...",
    referralCode: "...",
    totalCommission: "0.00",
    pendingCommission: "0.00",
    paidCommission: "0.00",
  });
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
  }, [id]);

  async function fetchCommissions() {
    setLoading(true);
    try {
      const res = await api.get(`/drivers/${id}/referral-commission`);
      if (res.data) {
        setSummary(res.data.summary || {});
        setCommissions(res.data.commissions || []);
      }
    } catch (err) {
      console.error("Failed to load driver referral commissions:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="crm-referral-page-wrap">
      {/* Top Header */}
      <div className="crm-referral-top-header">
        <div>
          <h6 className="crm-referral-top-title">Driver Referral Commission List (5% on Wallet Recharge)</h6>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span className="crm-referral-auto-badge" title="Commission is automatically credited to driver wallet on 1st of every month">
            ⚡ Auto-Credit: 1st Date of Every Month
          </span>

          <button
            type="button"
            className="crm-referral-back-btn"
            onClick={fetchCommissions}
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
          <h4 className="crm-referral-summary-value">{summary.referralDriver}</h4>
        </div>

        <div className="crm-referral-summary-card">
          <h6 className="crm-referral-summary-label">Referral Code</h6>
          <h4 className="crm-referral-summary-value">{summary.referralCode}</h4>
        </div>

        <div className="crm-referral-summary-card">
          <h6 className="crm-referral-summary-label">Total Commission (5%)</h6>
          <h4 className="crm-referral-summary-value text-success">₹ {summary.totalCommission}</h4>
          <span style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
            Credited: ₹{summary.paidCommission} | Pending: ₹{summary.pendingCommission}
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="crm-referral-main-card">
        <div className="crm-referral-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          <h4 className="crm-referral-card-title">Driver Referral Commission List</h4>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            * Note: Monthly 5% commission is added to driver wallet on 1st of next month
          </span>
        </div>

        <div className="crm-referral-card-body">
          <div className="crm-referral-table-wrap">
            <table className="crm-referral-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Referred Driver</th>
                  <th>State</th>
                  <th>Mobile</th>
                  <th>Recharge Amount</th>
                  <th>Commission %</th>
                  <th>Commission Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="crm-referral-no-data" style={{ color: "var(--text-muted)" }}>
                      Loading referral commissions...
                    </td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="crm-referral-no-data">
                      No referral commission found.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c, i) => (
                    <tr key={c.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={c.driverImage}
                            alt=""
                            style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.driverName || "Driver")}&background=0D8ABC&color=fff`;
                            }}
                          />
                          <span><strong>{c.driverName}</strong></span>
                        </div>
                      </td>
                      <td>{c.state}</td>
                      <td>{c.driverPhone}</td>
                      <td>₹ {c.rechargeAmount}</td>
                      <td><span style={{ color: "#3b82f6", fontWeight: 600 }}>{c.commisionPercent}</span></td>
                      <td><strong style={{ color: "#10b981" }}>₹ {c.commisionAmount}</strong></td>
                      <td>
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background:
                              c.rawStatus === "1"
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(234, 179, 8, 0.15)",
                            color: c.rawStatus === "1" ? "#10b981" : "#eab308",
                          }}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td>{c.date}</td>
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
