import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Leaf, TrendingUp, Eye, RefreshCw } from "lucide-react";
import api from "../../../../api/axios";
import "./CampaignListPage.css";

export default function CampaignListPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    organicUsers: 0,
    nonOrganicUsers: 0,
    totalUsers: 0,
    mediaSources: [],
  });

  async function fetchCampaigns() {
    setLoading(true);
    try {
      const res = await api.get("/users/campaigns");
      if (res.data) {
        setData({
          organicUsers: res.data.organicUsers || 0,
          nonOrganicUsers: res.data.nonOrganicUsers || 0,
          totalUsers: res.data.totalUsers || 0,
          mediaSources: res.data.mediaSources || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch campaigns:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  function handleViewUsers(source) {
    navigate(`/admin/campaigns/media-source/${encodeURIComponent(source)}`);
  }

  return (
    <div className="campaign-list-page">
      {/* ============ Header banner ============ */}
      <div className="campaign-header-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
        <div>
          <h1>🚕 Bhrosa Cab - Campaigns List</h1>
          <p>View Organic &amp; Non-Organic User Statistics</p>
        </div>
        <button
          onClick={fetchCampaigns}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--accent, #ff5722)",
            color: "#fff",
            border: "none",
            borderRadius: "20px",
            padding: "8px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh Stats</span>
        </button>
      </div>

      {/* ============ Organic / Non-Organic stat cards ============ */}
      <div className="campaign-stats-grid">
        <div className="campaign-stat-card organic">
          <div className="campaign-stat-label">ORGANIC USERS</div>
          <div className="campaign-stat-value">{loading ? "..." : data.organicUsers}</div>
          <div className="campaign-stat-desc">Users installed naturally without campaign links</div>
          <Leaf className="campaign-stat-icon" size={64} />
        </div>

        <div className="campaign-stat-card non-organic">
          <div className="campaign-stat-label">NON-ORGANIC USERS</div>
          <div className="campaign-stat-value">{loading ? "..." : data.nonOrganicUsers}</div>
          <div className="campaign-stat-desc">Users acquired via marketing ad campaigns</div>
          <Megaphone className="campaign-stat-icon" size={64} />
        </div>
      </div>

      {/* ============ Campaign Media Sources table ============ */}
      <div className="campaign-table-wrap">
        <div className="campaign-table-header">
          <TrendingUp size={18} />
          <h2>Campaign Media Sources ({data.mediaSources.length})</h2>
        </div>

        <table className="campaign-table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>#</th>
              <th>Media Source</th>
              <th>Total Users</th>
              <th style={{ textAlign: "center" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  Loading media source campaigns...
                </td>
              </tr>
            ) : data.mediaSources.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No marketing media sources tracked yet. All current users are Organic.
                </td>
              </tr>
            ) : (
              data.mediaSources.map((row, index) => (
                <tr key={row.source || index}>
                  <td style={{ textAlign: "center" }}>{index + 1}</td>
                  <td>
                    <span className="campaign-source-badge">{row.source}</span>
                  </td>
                  <td>
                    <span className="campaign-users-badge">{row.totalUsers}</span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="campaign-view-btn"
                      onClick={() => handleViewUsers(row.source)}
                    >
                      <Eye size={14} /> View Users
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
