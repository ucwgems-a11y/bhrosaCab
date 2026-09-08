import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "../../promo/promoShared.css";

export default function IconsPage() {
  const navigate = useNavigate();
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchIcons();
  }, []);

  async function fetchIcons(query = search) {
    setLoading(true);
    try {
      const res = await api.get(`/icons?search=${encodeURIComponent(query)}`);
      if (res.data && res.data.icons) {
        setIcons(res.data.icons);
      }
    } catch (err) {
      console.error("Failed to load icons:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearch(val);
    fetchIcons(val);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      showErrorAlert("Please enter icon name");
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (file) {
        formData.append("image", file);
      }

      const res = await api.post("/icons", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        showSuccessAlert("Icon added successfully!");
        setName("");
        setFile(null);
        // Reset file input element
        const fileInput = document.getElementById("image");
        if (fileInput) fileInput.value = "";
        fetchIcons();
      }
    } catch (err) {
      console.error("Failed to add icon:", err);
      showErrorAlert(err.response?.data?.message || "Failed to add icon");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/icons/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this app icon!",
      deletedText: "Icon has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/icons/${id}`);
          setIcons((prev) => prev.filter((i) => i.id !== id && i._id !== id));
          showSuccessAlert("Icon deleted successfully!");
        } catch (err) {
          console.error("Failed to delete icon:", err);
          showErrorAlert("Failed to delete icon");
        }
      },
    });
  }

  return (
    <div>
      {/* ============ Add Icon form ============ */}
      <div className="form-card">
        <h2 className="form-card-heading">Add Icon</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name <span style={{ color: "#ef4444" }}>*</span></label>
          <input
            id="name"
            type="text"
            placeholder="e.g. Dollar, Coupon, Taxi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="image">Icon / Image Asset (Optional)</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit" className="form-submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>

      {/* ============ Added Icon's list ============ */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", margin: "24px 0 12px" }}>
        <h1 className="data-page-title" style={{ margin: 0 }}>Added Icon's</h1>
        <input
          type="search"
          placeholder="Search icons..."
          value={search}
          onChange={handleSearchChange}
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

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Name</th>
              <th>Icon</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="data-no-data">
                  Loading icons...
                </td>
              </tr>
            ) : icons.length === 0 ? (
              <tr>
                <td colSpan={4} className="data-no-data">
                  No icons found
                </td>
              </tr>
            ) : (
              icons.map((row, i) => (
                <tr key={row.id || row._id}>
                  <td>{i + 1}</td>
                  <td>{row.name}</td>
                  <td className="data-icon-cell" style={{ fontSize: 24, verticalAlign: "middle" }}>
                    {row.image ? (
                      <img
                        src={row.image}
                        alt=""
                        style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "6px" }}
                      />
                    ) : (
                      row.icon || "⭐"
                    )}
                  </td>
                  <td>
                    <div className="data-action-icons">
                      <button className="data-icon-btn edit" onClick={() => handleEdit(row.id || row._id)} title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="data-icon-btn delete" onClick={() => handleDelete(row.id || row._id)} title="Delete">
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
