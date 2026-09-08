import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import "./RechargeHistoryPage.css";

export default function RechargeHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [recharges, setRecharges] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    fetchRecharges(1, search);
  }, []);

  async function fetchRecharges(page = 1, searchQuery = search) {
    setLoading(true);
    try {
      let url = `/drivers/wallet/recharge-history?page=${page}&limit=20`;
      if (searchQuery && searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await api.get(url);
      if (res.data && res.data.success) {
        setRecharges(res.data.recharges || []);
        setStats(res.data.stats || []);
        setTotalResults(res.data.totalResults || 0);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
      }
    } catch (err) {
      console.error("Failed to load recharge history:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    fetchRecharges(1, val);
  }

  function handleTopup() {
    navigate("/admin/recharge-history/topup");
  }

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchRecharges(page, search);
  }

  return (
    <div>
      <div className="recharge-header-card">
        <h1 className="recharge-page-title">All Recharge History</h1>

        <div className="recharge-header-actions">
          <div className="recharge-stats-row">
            {stats.map((s) => (
              <span key={s.label} className="recharge-stat-pill" style={{ background: s.color }}>
                {s.label}
              </span>
            ))}
          </div>
          <button className="recharge-topup-btn" onClick={handleTopup}>
            Topup Wallet
          </button>
        </div>
      </div>

      <div className="recharge-search-row">
        <label htmlFor="recharge-search">Search:</label>
        <input
          id="recharge-search"
          type="search"
          placeholder="Search driver name, phone, txn..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="recharge-table-wrap">
        <table className="recharge-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Transaction ID / Reason</th>
              <th>Date &amp; Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "30px" }}>
                  Loading recharge history...
                </td>
              </tr>
            ) : recharges.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "30px" }}>
                  No recharge records found
                </td>
              </tr>
            ) : (
              recharges.map((row, idx) => (
                <tr key={row.id || row._id || idx}>
                  <td>{row.srNo || idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    {row.name}
                    {row.driverPhone && (
                      <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontWeight: 400 }}>
                        {row.driverPhone}
                      </span>
                    )}
                  </td>
                  <td><span className="recharge-type-badge">{row.type}</span></td>
                  <td style={{ fontWeight: 600, color: String(row.amount).startsWith("-") ? "#ef4444" : "#22c55e" }}>
                    ₹ {row.amount}
                  </td>
                  <td>{row.txnId}</td>
                  <td>{row.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="recharge-pagination-row">
        <p className="recharge-pagination-info">
          Showing <strong>{recharges.length > 0 ? (currentPage - 1) * 20 + 1 : 0}</strong> to{" "}
          <strong>{Math.min(currentPage * 20, totalResults)}</strong> of <strong>{totalResults}</strong> results
        </p>

        {totalPages > 1 && (
          <div className="recharge-pagination-buttons">
            <button
              disabled={currentPage === 1}
              onClick={() => goToPage(currentPage - 1)}
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((page, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <span key={page} style={{ display: "inline-flex" }}>
                    {showEllipsis && <span className="recharge-pagination-dots">...</span>}
                    <button
                      className={currentPage === page ? "active" : ""}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => goToPage(currentPage + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}