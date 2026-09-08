import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "../settingsShared.css";

export default function ManageEmergencyPage() {
  const navigate = useNavigate();
  const [emergencyNumbers, setEmergencyNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", number: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEmergencyNumbers();
  }, []);

  async function fetchEmergencyNumbers() {
    setLoading(true);
    try {
      const res = await api.get("/settings/emergency");
      if (res.data && res.data.list) {
        setEmergencyNumbers(res.data.list);
      }
    } catch (err) {
      console.error("Failed to load emergency numbers:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredEmergencyNumbers = emergencyNumbers.filter((e) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (e.name || "").toLowerCase().includes(q) ||
      (e.number || "").toLowerCase().includes(q)
    );
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.number.trim()) return;
    setSubmitting(true);

    try {
      const res = await api.post("/settings/emergency", {
        name: form.name.trim(),
        number: form.number.trim(),
      });
      if (res.data && res.data.success) {
        showSuccessAlert("Emergency number added successfully!");
        setForm({ name: "", number: "" });
        fetchEmergencyNumbers();
      }
    } catch (err) {
      console.error("Failed to add emergency number:", err);
      showErrorAlert(err.response?.data?.message || "Failed to add emergency number");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/settings/emergency/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this emergency helpline!",
      deletedText: "Emergency number has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/settings/emergency/${id}`);
          setEmergencyNumbers((prev) => prev.filter((e) => e.id !== id && e._id !== id));
          showSuccessAlert("Emergency number deleted successfully!");
        } catch (err) {
          console.error("Failed to delete emergency number:", err);
          showErrorAlert("Failed to delete emergency number");
        }
      },
    });
  }

  return (
    <div>
      <div className="settings-form-card">
        <h2 className="settings-form-heading">Add Emergency-number</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Police, Ambulance"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="number">Number</label>
          <input
            id="number"
            name="number"
            type="text"
            placeholder="e.g. 100, 108"
            value={form.number}
            onChange={handleChange}
            required
          />

          <button type="submit" className="settings-submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", margin: "24px 0 12px" }}>
        <h1 className="settings-page-title" style={{ margin: 0 }}>Added Emergency-Numbers</h1>
        <input
          type="search"
          placeholder="Search emergency numbers..."
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

      <div className="settings-table-wrap">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Name</th>
              <th>Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  Loading emergency numbers...
                </td>
              </tr>
            ) : filteredEmergencyNumbers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  No emergency numbers found
                </td>
              </tr>
            ) : (
              filteredEmergencyNumbers.map((row, i) => (
                <tr key={row.id || row._id}>
                  <td>{i + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.number}</td>
                  <td>
                    <div className="settings-action-icons">
                      <button className="settings-icon-btn edit" onClick={() => handleEdit(row.id || row._id)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="settings-icon-btn delete" onClick={() => handleDelete(row.id || row._id)} title="Delete">
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
