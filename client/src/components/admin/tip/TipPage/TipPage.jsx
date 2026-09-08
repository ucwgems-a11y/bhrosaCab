import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./TipPage.css";

export default function TipPage() {
  const navigate = useNavigate();
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch Tips from API
  async function fetchTips() {
    setLoading(true);
    try {
      const res = await api.get("/tips");
      if (res.data && res.data.tips) {
        setTips(res.data.tips);
      }
    } catch (err) {
      console.error("Failed to fetch tip amounts:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTips();
  }, []);

  const filteredTips = tips.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      String(t.amount).includes(q) ||
      String(t.id).includes(q)
    );
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);
    try {
      await api.post("/tips", { amount: Number(amount) });
      showSuccessAlert("Tip amount added successfully!", 1200);
      setAmount("");
      fetchTips();
    } catch (err) {
      console.error("Failed to add tip amount:", err);
      showErrorAlert(err.response?.data?.message || "Failed to add tip amount");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/tip/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this tip denomination!",
      deletedText: "Tip amount has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/tips/${id}`);
          setTips((prev) => prev.filter((t) => t.id !== id && t._id !== id));
        } catch (err) {
          console.error("Failed to delete tip:", err);
          showErrorAlert("Failed to delete tip amount");
        }
      },
    });
  }

  return (
    <div>
      {/* ============ Add Tip-Amount form ============ */}
      <div className="tip-form-card">
        <h2 className="tip-form-heading">Add Tip-Amount</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="amount">Tip-amount (₹)</label>
          <input
            id="amount"
            type="number"
            min="1"
            placeholder="e.g. 50"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button type="submit" className="tip-submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>

      {/* ============ Added Tips-Amount table ============ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", margin: "24px 0 12px" }}>
        <h1 className="tip-page-title" style={{ margin: 0 }}>Added Tips-Amount [{tips.length}]</h1>
        <input
          type="search"
          placeholder="Search tip amount..."
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
      </div>

      <div className="tip-table-wrap">
        <table className="tip-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                  Loading tip amounts...
                </td>
              </tr>
            ) : filteredTips.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  No tip amounts found
                </td>
              </tr>
            ) : (
              filteredTips.map((row, i) => (
                <tr key={row.id || row._id}>
                  <td>{i + 1}</td>
                  <td>₹ {row.amount}</td>
                  <td>
                    <div className="tip-action-icons">
                      <button className="tip-icon-btn edit" onClick={() => handleEdit(row.id || row._id)} title="Edit Tip">
                        <Pencil size={14} />
                      </button>
                      <button className="tip-icon-btn delete" onClick={() => handleDelete(row.id || row._id)} title="Delete Tip">
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
