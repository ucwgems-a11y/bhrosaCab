import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "../promoShared.css";

export default function PromoManagePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromos();
  }, []);

  async function fetchPromos(searchQuery = search) {
    setLoading(true);
    try {
      const res = await api.get(`/promos?search=${encodeURIComponent(searchQuery)}`);
      if (res.data && res.data.promos) {
        setPromos(res.data.promos);
      }
    } catch (err) {
      console.error("Failed to load promos:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    fetchPromos(val);
  }

  function handleEdit(id) {
    navigate(`/admin/promo/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this promo coupon!",
      deletedText: "Promo code has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/promos/${id}`);
          setPromos((prev) => prev.filter((p) => p.id !== id && p._id !== id));
          showSuccessAlert("Promo code deleted successfully!");
        } catch (err) {
          console.error("Failed to delete promo:", err);
          showErrorAlert("Failed to delete promo coupon");
        }
      },
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <h1 className="data-page-title" style={{ margin: 0 }}>Manage Promo</h1>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/promo/add")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "var(--accent, #fd683e)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "8px 16px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <Plus size={16} />
          <span>Add New Promo</span>
        </button>
      </div>

      <div className="data-search-row">
        <input
          type="text"
          placeholder="Search promo code or title..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Promo Code</th>
              <th>Title</th>
              <th>Discount (%)</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="data-no-data">
                  Loading promo coupons...
                </td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={8} className="data-no-data">
                  No promos found
                </td>
              </tr>
            ) : (
              promos.map((promo, i) => (
                <tr key={promo.id || promo._id}>
                  <td>{i + 1}</td>
                  <td>
                    <span style={{ fontWeight: 700, letterSpacing: "0.5px", color: "var(--accent, #fd683e)" }}>
                      {promo.code}
                    </span>
                  </td>
                  <td>{promo.title}</td>
                  <td><strong>{promo.discount}</strong></td>
                  <td>{promo.startDate || promo.start}</td>
                  <td>{promo.endDate || promo.end}</td>
                  <td>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "11.5px",
                      fontWeight: 700,
                      background:
                        promo.status === "Active"
                          ? "rgba(16, 185, 129, 0.15)"
                          : promo.status === "Coming Soon"
                          ? "rgba(245, 158, 11, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                      color:
                        promo.status === "Active"
                          ? "#10b981"
                          : promo.status === "Coming Soon"
                          ? "#f59e0b"
                          : "#ef4444",
                      border:
                        promo.status === "Active"
                          ? "1px solid rgba(16, 185, 129, 0.3)"
                          : promo.status === "Coming Soon"
                          ? "1px solid rgba(245, 158, 11, 0.3)"
                          : "1px solid rgba(239, 68, 68, 0.3)",
                    }}>
                      {promo.status}
                    </span>
                  </td>
                  <td>
                    <div className="data-action-icons">
                      <button className="data-icon-btn edit" onClick={() => handleEdit(promo.id || promo._id)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="data-icon-btn delete" onClick={() => handleDelete(promo.id || promo._id)} title="Delete">
                        <Trash2 size={14} />
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
  );
}
