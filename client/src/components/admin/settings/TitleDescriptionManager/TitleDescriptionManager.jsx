import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "../settingsShared.css";

export default function TitleDescriptionManager({
  formHeading,
  submitLabel,
  listHeading,
  apiEndpoint,
  editRouteBase,
}) {
  const navigate = useNavigate();
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (apiEndpoint) fetchItems();
  }, [apiEndpoint]);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await api.get(apiEndpoint);
      if (res.data && res.data.list) {
        setDataList(res.data.list);
      }
    } catch (err) {
      console.error(`Failed to load from ${apiEndpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    setSubmitting(true);

    try {
      const res = await api.post(apiEndpoint, {
        title: form.title.trim(),
        description: form.description.trim(),
      });
      if (res.data && res.data.success) {
        showSuccessAlert("Saved successfully!");
        setForm({ title: "", description: "" });
        fetchItems();
      }
    } catch (err) {
      console.error("Failed to save clause:", err);
      showErrorAlert(err.response?.data?.message || "Failed to save clause");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    if (editRouteBase) {
      navigate(`${editRouteBase}/${id}`);
    }
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this content clause!",
      deletedText: "Clause has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`${apiEndpoint}/${id}`);
          setDataList((prev) => prev.filter((item) => item.id !== id && item._id !== id));
          showSuccessAlert("Clause deleted successfully!");
        } catch (err) {
          console.error("Failed to delete clause:", err);
          showErrorAlert("Failed to delete clause");
        }
      },
    });
  }

  return (
    <div>
      <div className="settings-form-card">
        <h2 className="settings-form-heading">{formHeading}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Enter description..."
            value={form.description}
            onChange={handleChange}
            required
          />

          <button type="submit" className="settings-submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : submitLabel}
          </button>
        </form>
      </div>

      <h1 className="settings-page-title">{listHeading}</h1>

      <div className="settings-table-wrap">
        <table className="settings-table">
          <thead>
            <tr>
              <th style={{ width: "8%" }}>Sr.no</th>
              <th style={{ width: "25%" }}>Title</th>
              <th>Description</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  Loading clauses...
                </td>
              </tr>
            ) : dataList.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  No clauses found
                </td>
              </tr>
            ) : (
              dataList.map((row, i) => (
                <tr key={row.id || row._id}>
                  <td>{i + 1}</td>
                  <td>{row.title}</td>
                  <td className="description-cell">{row.description}</td>
                  <td>
                    <div className="settings-action-icons">
                      <button
                        className="settings-icon-btn edit"
                        title="Edit"
                        onClick={() => handleEdit(row.id || row._id)}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="settings-icon-btn delete"
                        title="Delete"
                        onClick={() => handleDelete(row.id || row._id)}
                      >
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
