import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import "./DriverWalletHistoryPage.css";

export default function DriverWalletHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState([]);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletHistory();
  }, [id]);

  async function fetchWalletHistory() {
    setLoading(true);
    try {
      const res = await api.get(`/drivers/${id}/wallet-history`);
      if (res.data && res.data.success) {
        setHistory(res.data.history || []);
        setDriver(res.data.driver || null);
      }
    } catch (err) {
      console.error("Failed to load driver wallet history:", err);
    } finally {
      setLoading(false);
    }
  }

  const driverDisplayName = driver ? driver.name : "Driver";

  const filteredHistory = history.filter((h) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (h.type || "").toLowerCase().includes(q) ||
      (h.date || "").toLowerCase().includes(q) ||
      (h.amount || "").toLowerCase().includes(q) ||
      driverDisplayName.toLowerCase().includes(q) ||
      String(h.id || h._id).includes(q)
    );
  });

  function handleBack() {
    navigate("/admin/drivers/wallet");
  }

  return (
    <div className="walletlog-page-wrap">
      <div className="walletlog-card">
        <div className="walletlog-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h4 style={{ margin: 0 }}>Driver Wallet Recharge History ({driverDisplayName})</h4>
            {driver && (
              <small style={{ color: "var(--text-muted, #94a3b8)", fontSize: "12px" }}>
                Phone: {driver.number} | Current Balance: ₹{driver.wallet}
              </small>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="search"
              placeholder="Search wallet logs..."
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
            <button className="walletlog-back-btn" onClick={handleBack}>
              Back to Wallet
            </button>
          </div>
        </div>

        <div className="walletlog-card-body">
          <div className="walletlog-table-wrap">
            <table className="walletlog-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date &amp; Time</th>
                  <th>Driver Name</th>
                  <th>Amount</th>
                  <th>Type / Transaction</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="walletlog-no-data" style={{ padding: "30px", textAlign: "center" }}>
                      Loading wallet history...
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="walletlog-no-data" style={{ padding: "30px", textAlign: "center" }}>
                      No wallet transactions found for this driver
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((h, i) => (
                    <tr key={h.id || h._id || i} className={i % 2 === 0 ? "walletlog-row-even" : ""}>
                      <td>{h.srNo || i + 1}</td>
                      <td>{h.date}</td>
                      <td>{h.driverName || driverDisplayName}</td>
                      <td className={String(h.amount).startsWith("-") ? "walletlog-negative" : "walletlog-positive"} style={{ fontWeight: 600 }}>
                        ₹{h.amount}
                      </td>
                      <td>{h.type}</td>
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