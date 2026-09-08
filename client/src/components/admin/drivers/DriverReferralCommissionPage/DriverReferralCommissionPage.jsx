import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import api from "../../../../api/axios";
import "./DriverReferralCommissionPage.css";

export default function DriverReferralCommissionPage() {
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
    <div className="refcomm-page-wrap">
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate(-1)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--card-bg, #1a222d)",
            color: "var(--text-main, #fff)",
            border: "1px solid var(--border-color, #2a3441)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Driver Profile</span>
        </button>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span className="refcomm-auto-tag" title="Commission is automatically credited to driver wallet on 1st of every month">
            ⚡ Auto-Credit: 1st Date of Every Month
          </span>

          <button
            type="button"
            onClick={fetchCommissions}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--card-bg, #1a222d)",
              color: "var(--text-main, #fff)",
              border: "1px solid var(--border-color, #2a3441)",
              borderRadius: "8px",
              padding: "8px 14px",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      <h6 className="refcomm-subheading">Driver Referral Commission List (5% on Wallet Recharge)</h6>

      <div className="refcomm-summary-grid">
        <div className="refcomm-summary-card">
          <h6>Referral Driver</h6>
          <h4>{summary.referralDriver}</h4>
        </div>
        <div className="refcomm-summary-card">
          <h6>Referral Code</h6>
          <h4>{summary.referralCode}</h4>
        </div>
        <div className="refcomm-summary-card">
          <h6>Total Earned Commission (5%)</h6>
          <h4 className="refcomm-amount">₹ {summary.totalCommission}</h4>
          <span style={{ fontSize: "12px", color: "var(--text-muted, #94a3b8)", marginTop: "4px", display: "block" }}>
            Credited: ₹{summary.paidCommission} | Pending: ₹{summary.pendingCommission}
          </span>
        </div>
      </div>

      <div className="refcomm-card">
        <div className="refcomm-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4>Driver Referral Commission List</h4>
          <span style={{ fontSize: "12px", color: "var(--text-muted, #94a3b8)" }}>
            * Note: Current month 5% commission is added to driver wallet on 1st of next month
          </span>
        </div>
        <div className="refcomm-card-body">
          <div className="refcomm-table-wrap">
            <table className="refcomm-table">
              <thead>
                <tr>
                  <th>Sr.No</th>
                  <th>Referred Driver</th>
                  <th>State</th>
                  <th>Mobile</th>
                  <th>Recharge Amount</th>
                  <th>Commission %</th>
                  <th>Commission Amount</th>
                  <th>Payout Status</th>
                  <th>Recharge Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="refcomm-no-data">
                      Loading commission history...
                    </td>
                  </tr>
                ) : commissions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="refcomm-no-data">
                      No referral commission found.
                    </td>
                  </tr>
                ) : (
                  commissions.map((c, i) => (
                    <tr key={c.id || i}>
                      <td>{i + 1}</td>
                      <td><strong>{c.driverName}</strong></td>
                      <td>{c.state}</td>
                      <td>{c.mobile}</td>
                      <td>{c.rechargeAmount}</td>
                      <td><span className="fc-badge active">{c.commissionPercent}</span></td>
                      <td><strong style={{ color: "#10b981" }}>{c.commissionAmount}</strong></td>
                      <td>
                        <span
                          className={`fc-badge ${c.statusCode === "1" ? "active" : "pending"}`}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            background: c.statusCode === "1" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                            color: c.statusCode === "1" ? "#10b981" : "#f59e0b",
                            border: `1px solid ${c.statusCode === "1" ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
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