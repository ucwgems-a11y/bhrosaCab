import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Car, Wallet, Search } from "lucide-react";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../driverTable.css";

export default function DriverWalletPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchWallets(1, activeSearch);
  }, []);

  async function fetchWallets(page = 1, query = activeSearch) {
    setLoading(true);
    try {
      let url = `/drivers?page=${page}&limit=20`;
      if (query && query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;

      const res = await api.get(url);
      if (res.data && res.data.drivers) {
        setDrivers(res.data.drivers);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        setTotalRecords(res.data.total || res.data.drivers.length);
      }
    } catch (err) {
      console.error("Failed to load driver wallets:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveSearch(searchInput);
    fetchWallets(1, searchInput);
  }

  function handleReload() {
    setSearchInput("");
    setActiveSearch("");
    fetchWallets(1, "");
  }

  function handleRidesDetail(id) {
    navigate(`/admin/drivers/${id}/rides`);
  }

  function handleWalletDetail(id) {
    navigate(`/admin/drivers/${id}/wallet-history`);
  }

  return (
    <div className="driver-page-container">
      {/* 1. Header Title */}
      <h1 className="driver-main-title" style={{ marginBottom: "20px" }}>
        Manage Driver Wallet
      </h1>

      {/* 2. Controls Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search driver name, phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="driver-standalone-search-input"
          />
          <button type="submit" className="driver-btn-rounded-primary">
            <Search size={15} />
            Search
          </button>
        </form>

        <button
          type="button"
          onClick={handleReload}
          disabled={loading}
          className="driver-filter-btn reload"
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} />
          Reload
        </button>
      </div>

      {/* 3. Table Card Wrap */}
      <div className="driver-card-wrap">
        <div className="driver-table-responsive">
          <table className="driver-custom-table">
            <thead>
              <tr>
                <th>Sr.no</th>
                <th>Driver Image</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone no.</th>
                <th>Wallet Balance</th>
                <th>Total Rides</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="driver-no-data-cell">
                    Loading driver wallets...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="driver-no-data-cell">
                    No driver records found
                  </td>
                </tr>
              ) : (
                drivers.map((d, index) => (
                  <tr key={d.id || d._id}>
                    <td>{(currentPage - 1) * 20 + index + 1}</td>
                    <td>
                      <img
                        src={d.image}
                        alt={d.name}
                        className="driver-avatar-img"
                        onError={(e) => {
                          e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(d.name);
                        }}
                      />
                    </td>
                    <td><strong>{d.name}</strong></td>
                    <td>{d.email}</td>
                    <td>{d.phone}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: "var(--accent, #fd683e)", fontSize: "14px" }}>
                        ₹ {(d.wallet || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{d.totalRides !== undefined ? d.totalRides : 0}</span>
                    </td>
                    <td>
                      <div className="driver-action-icons-wrap">
                        <button
                          type="button"
                          className="driver-circle-btn view"
                          onClick={() => handleRidesDetail(d.id || d._id)}
                          title="Driver Rides"
                        >
                          <Car size={14} />
                        </button>
                        <button
                          type="button"
                          className="driver-circle-btn reupload"
                          onClick={() => handleWalletDetail(d.id || d._id)}
                          title="Wallet Transactions History"
                        >
                          <Wallet size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 4px" }}>
        <span style={{ color: "var(--text-muted, #94a3b8)", fontSize: "13px" }}>
          Showing {drivers.length} of {totalRecords} records (Page {currentPage} of {totalPages})
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => fetchWallets(p, activeSearch)}
        />
      </div>
    </div>
  );
}
