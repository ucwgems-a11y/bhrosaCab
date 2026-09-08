import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "../settingsShared.css";

export default function ContactUsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "" });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    try {
      const res = await api.get("/settings/contact-us");
      if (res.data && res.data.list) {
        setContacts(res.data.list);
      }
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("address", form.address.trim());
      if (file) formData.append("image", file);

      const res = await api.post("/settings/contact-us", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        showSuccessAlert("Contact channel saved successfully!");
        setForm({ name: "", address: "" });
        setFile(null);
        fetchContacts();
      }
    } catch (err) {
      console.error("Failed to save contact:", err);
      showErrorAlert(err.response?.data?.message || "Failed to save contact channel");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/settings/contact-us/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this contact channel!",
      deletedText: "Contact information has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/settings/contact-us/${id}`);
          setContacts((prev) => prev.filter((c) => c.id !== id && c._id !== id));
          showSuccessAlert("Contact channel deleted successfully!");
        } catch (err) {
          console.error("Failed to delete contact:", err);
          showErrorAlert("Failed to delete contact channel");
        }
      },
    });
  }

  return (
    <div>
      <div className="settings-form-card">
        <h2 className="settings-form-heading">Contact Us Add</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g. Customer Care, WhatsApp"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="address">Address / Phone / Link</label>
          <input
            id="address"
            name="address"
            type="text"
            placeholder="Phone number, email, or URL"
            value={form.address}
            onChange={handleChange}
            required
          />

          <label htmlFor="image">Image / Icon (Optional)</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button type="submit" className="settings-submit-btn" disabled={submitting}>
            {submitting ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>

      <h1 className="settings-page-title">Added ContactUS</h1>

      <div className="settings-table-wrap">
        <table className="settings-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Logo</th>
              <th>Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  Loading contacts...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                  No contacts found
                </td>
              </tr>
            ) : (
              contacts.map((row, i) => (
                <tr key={row.id || row._id}>
                  <td>{i + 1}</td>
                  <td className="settings-logo-cell" style={{ fontSize: 22 }}>
                    {row.image ? (
                      <img
                        src={row.image}
                        alt=""
                        style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "4px" }}
                      />
                    ) : (
                      row.logo || "📞"
                    )}
                  </td>
                  <td>{row.name}</td>
                  <td>{row.address}</td>
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
