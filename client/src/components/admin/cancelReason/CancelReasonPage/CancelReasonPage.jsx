import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./CancelReasonPage.css";

export default function CancelReasonPage() {
  const navigate = useNavigate();
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchCancelReasons() {
    setLoading(true);
    try {
      const res = await api.get("/cancel-reasons");
      if (res.data && res.data.reasons) {
        setReasons(res.data.reasons);
      }
    } catch (err) {
      console.error("Failed to fetch cancel reasons:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCancelReasons();
  }, []);

  const filteredReasons = reasons.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (r.reason || "").toLowerCase().includes(q) ||
      String(r.id).includes(q)
    );
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);

    try {
      await api.post("/cancel-reasons", { reason: reason.trim() });
      showSuccessAlert("Cancel reason added successfully!", 1200);
      setReason("");
      fetchCancelReasons();
    } catch (err) {
      console.error("Failed to add cancel reason:", err);
      showErrorAlert(err.response?.data?.message || "Failed to add cancel reason");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/cancel-reason/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this cancel reason!",
      deletedText: "Cancel reason has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/cancel-reasons/${id}`);
          setReasons((prev) => prev.filter((r) => r.id !== id && r._id !== id));
        } catch (err) {
          console.error("Failed to delete cancel reason:", err);
          showErrorAlert("Failed to delete cancel reason");
        }
      },
    });
  }

  return (
    <div>
      {/* ============ Add Cancel Reason form ============ */}
      <div className="cancel-reason-form-card">
        <h2 className="cancel-reason-form-heading">Add Cancel Reason</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="reason">Reason Text</label>
          <input
            id="reason"
            type="text"
            placeholder="e.g. Driver denied to come to pickup"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <button type="submit" className="cancel-reason-submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Add Reason"}
          </button>
        </form>
      </div>

      {/* ============ Added Reasons table ============ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", margin: "24px 0 12px" }}>
        <h1 className="cancel-reason-page-title" style={{ margin: 0 }}>Added Reasons [{reasons.length}]</h1>
        <input
          type="search"
          placeholder="Search reasons..."
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

      <div className="cancel-reason-table-wrap">
        <table className="cancel-reason-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                  Loading cancel reasons...
                </td>
              </tr>
            ) : filteredReasons.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  No cancel reasons found
                </td>
              </tr>
            ) : (
              filteredReasons.map((row, i) => (
                <tr key={row.id || row._id}>
                  <td>{i + 1}</td>
                  <td>{row.reason}</td>
                  <td>
                    <div className="cancel-reason-action-icons">
                      <button className="cancel-reason-icon-btn edit" onClick={() => handleEdit(row.id || row._id)} title="Edit Reason">
                        <Pencil size={14} />
                      </button>
                      <button className="cancel-reason-icon-btn delete" onClick={() => handleDelete(row.id || row._id)} title="Delete Reason">
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
