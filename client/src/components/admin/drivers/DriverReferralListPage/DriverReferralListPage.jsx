import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import api from "../../../../api/axios";
import "../../shared/formCard.css";

export default function DriverReferralListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, [id]);

  async function fetchReferrals() {
    setLoading(true);
    try {
      const res = await api.get(`/drivers/${id}/referrals`);
      if (res.data) {
        setReferrals(res.data.referrals || []);
        setDriverInfo(res.data.driver || null);
      }
    } catch (err) {
      console.error("Failed to load driver referrals:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fc-page-wrap">
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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

        {driverInfo && (
          <div style={{ fontSize: "14px", color: "var(--text-muted, #94a3b8)" }}>
            Driver: <strong style={{ color: "var(--text-main, #fff)" }}>{driverInfo.name}</strong> (Referral Code: <strong style={{ color: "#3b82f6" }}>{driverInfo.referalCode}</strong>)
          </div>
        )}
      </div>

      <div className="fc-card">
        <div className="fc-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 className="fc-card-title">Driver Referral List</h4>
          <button
            type="button"
            onClick={fetchReferrals}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted, #94a3b8)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Reload</span>
          </button>
        </div>
        <div className="fc-card-body">
          <div className="fc-table-wrap">
            <table className="fc-table">
              <thead>
                <tr>
                  <th>Sr.no</th>
                  <th>Driver Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone no.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="fc-no-data">
                      Loading referrals...
                    </td>
                  </tr>
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="fc-no-data">
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
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.phone}</td>
                      <td>
                        <span className={`fc-badge ${String(r.status).toLowerCase()}`}>
                          {r.status}
                        </span>
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