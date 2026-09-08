import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import api from "../../../../api/axios";
import "./MediaSourceUsersPage.css";

export default function MediaSourceUsersPage() {
  const { source } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await api.get(`/users/campaigns/media-source/${encodeURIComponent(source)}`);
      if (res.data && res.data.users) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch media source users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (source) {
      fetchUsers();
    }
  }, [source]);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.number || "").toLowerCase().includes(q) ||
      (u.eventName || "").toLowerCase().includes(q) ||
      (u.mediaSource || "").toLowerCase().includes(q) ||
      (u.campaign || "").toLowerCase().includes(q) ||
      (u.platform || "").toLowerCase().includes(q) ||
      (u.afStatus || "").toLowerCase().includes(q) ||
      String(u.id).includes(q)
    );
  });

  return (
    <div className="mediasource-page-wrap">
      <div className="mediasource-card">
        <div className="mediasource-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="mediasource-back-btn" onClick={() => navigate("/admin/users/campaigns")}>
              <ArrowLeft size={16} />
            </button>
            <h4>Media Source: <span style={{ color: "var(--accent, #ff5722)" }}>{source}</span> ({users.length} Users)</h4>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="search"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color, #334155)",
                background: "var(--bg-main, #0f172a)",
                color: "var(--text-main, #fff)",
                fontSize: "13px",
                outline: "none",
              }}
            />
            <button
              onClick={fetchUsers}
              style={{
                background: "var(--bg-card, #1e293b)",
                border: "1px solid var(--border-color, #334155)",
                color: "var(--text-main, #fff)",
                borderRadius: "6px",
                padding: "6px 12px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
              }}
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="mediasource-card-body">
          <div className="mediasource-table-wrap">
            <table className="mediasource-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Number</th>
                  <th>Event Name</th>
                  <th>Media Source</th>
                  <th>Campaign</th>
                  <th>Campaign Id</th>
                  <th>Adset</th>
                  <th>Adset Id</th>
                  <th>Ad</th>
                  <th>Ad Id</th>
                  <th>Channel</th>
                  <th>Af Status</th>
                  <th>Install Time</th>
                  <th>Platform</th>
                  <th>App Version</th>
                  <th>Event Time</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={17} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      Loading media source user details...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="mediasource-no-data">
                      No users found for this media source
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, i) => (
                    <tr key={u.id || i}>
                      <td>{i + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.number}</td>
                      <td>{u.eventName}</td>
                      <td>
                        <span className="campaign-source-badge" style={{ fontSize: "11px", padding: "2px 8px" }}>
                          {u.mediaSource}
                        </span>
                      </td>
                      <td>{u.campaign}</td>
                      <td>{u.campaignId}</td>
                      <td>{u.adset}</td>
                      <td>{u.adsetId}</td>
                      <td>{u.ad}</td>
                      <td>{u.adId}</td>
                      <td>{u.channel}</td>
                      <td>{u.afStatus}</td>
                      <td>{u.installTime}</td>
                      <td>{u.platform}</td>
                      <td>{u.appVersion}</td>
                      <td>{u.eventTime}</td>
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
