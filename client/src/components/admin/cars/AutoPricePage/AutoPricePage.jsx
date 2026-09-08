import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../carsTable.css";

export default function AutoPricePage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchPrices();
  }, []);

  async function fetchPrices() {
    setLoading(true);
    try {
      const res = await api.get("/cars/auto-prices");
      if (res.data && res.data.prices) {
        setPrices(res.data.prices);
      }
    } catch (err) {
      console.error("Failed to load auto prices:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredPrices = prices.filter((p) =>
    (p.state || p.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPrices.length / pageSize) || 1;
  const paginatedPrices = filteredPrices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="cars-page-wrap">
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/cars/fare")}
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
          <span>Back to Manage Cars Fare</span>
        </button>
      </div>

      <div className="cars-card">
        <div className="cars-card-header">
          <h4 className="cars-card-title">Added Fare</h4>
        </div>
        <div className="cars-card-body">
          <div className="cars-table-toolbar">
            <input
              type="search"
              className="cars-table-search"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="cars-table-wrap">
            <table className="cars-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>State / City</th>
                  <th>Fare Per KM (₹)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="cars-no-data">
                      Loading auto prices...
                    </td>
                  </tr>
                ) : paginatedPrices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="cars-no-data">
                      No auto prices found
                    </td>
                  </tr>
                ) : (
                  paginatedPrices.map((p, i) => (
                    <tr key={p.id || p._id}>
                      <td>{(currentPage - 1) * pageSize + i + 1}</td>
                      <td>{p.state || p.city || "N/A"}</td>
                      <td>{p.farePerKm}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
