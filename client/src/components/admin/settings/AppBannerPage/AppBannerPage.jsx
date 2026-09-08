import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, X } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./AppBannerPage.css";

const bannerTypes = [
  { value: "1", label: "Home Screen" },
  { value: "2", label: "Ride Top Screen" },
  { value: "3", label: "Ride Footer Screen" },
];

export default function AppBannerPage() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "",
    link: "",
    startDate: "",
    endDate: "",
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewingBanner, setViewingBanner] = useState(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    setLoading(true);
    try {
      const res = await api.get("/settings/app-banners");
      if (res.data && res.data.list) {
        setBanners(res.data.list);
      }
    } catch (err) {
      console.error("Failed to load app banners:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.type || !form.startDate || !form.endDate) return;
    if (!file) {
      showErrorAlert("Please choose a banner image to upload");
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("link", form.link || "");
      formData.append("startDate", form.startDate);
      formData.append("endDate", form.endDate);
      formData.append("image", file);

      const res = await api.post("/settings/app-banners", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        showSuccessAlert("App Banner saved successfully!");
        setForm({ type: "", link: "", startDate: "", endDate: "" });
        setFile(null);
        fetchBanners();
      }
    } catch (err) {
      console.error("Failed to save banner:", err);
      showErrorAlert(err.response?.data?.message || "Failed to save app banner");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/settings/app-banner/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this app banner!",
      deletedText: "Banner has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/settings/app-banners/${id}`);
          setBanners((prev) => prev.filter((b) => b.id !== id && b._id !== id));
          showSuccessAlert("App banner deleted successfully!");
        } catch (err) {
          console.error("Failed to delete banner:", err);
          showErrorAlert("Failed to delete app banner");
        }
      },
    });
  }

  return (
    <div>
      <div className="banner-form-card">
        <h2 className="banner-form-heading">🖼️ Banner Images</h2>

        <form onSubmit={handleSubmit}>
          <div className="banner-form-grid">
            <div>
              <label>
                Type <span className="banner-required">*</span>
              </label>
              <select name="type" value={form.type} onChange={handleChange} required>
                <option value="">Select Type</option>
                {bannerTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label>
                Banner Image <span className="banner-required">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <div className="banner-form-full">
              <label>Redirect Link</label>
              <input
                type="url"
                name="link"
                placeholder="https://example.com"
                value={form.link}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>
                Start Date <span className="banner-required">*</span>
              </label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
            </div>

            <div>
              <label>
                End Date <span className="banner-required">*</span>
              </label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="banner-submit-row">
            <button type="submit" className="banner-submit-btn" disabled={submitting}>
              {submitting ? "Saving..." : "💾 Save Banner"}
            </button>
          </div>
        </form>
      </div>

      <div className="banner-list-card">
        <h2 className="banner-form-heading">📋 Banner List</h2>

        <div className="banner-table-wrap">
          <table className="banner-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Banner</th>
                <th>Type</th>
                <th>Link</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                    Loading app banners...
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", fontStyle: "italic", padding: "20px" }}>
                    No app banners found
                  </td>
                </tr>
              ) : (
                banners.map((row, i) => (
                  <tr key={row.id || row._id}>
                    <td>{i + 1}</td>
                    <td>
                      <img
                        src={row.image}
                        alt="Banner"
                        className="banner-thumb"
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                      />
                    </td>
                    <td>{row.type}</td>
                    <td>{row.link}</td>
                    <td>{row.startDate}</td>
                    <td>{row.endDate}</td>
                    <td>
                      <div className="settings-action-icons">
                        <button className="settings-icon-btn view" onClick={() => setViewingBanner(row)} title="View Details">
                          <Eye size={14} />
                        </button>
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

      {/* ============ View Banner modal ============ */}
      {viewingBanner && (
        <div className="banner-modal-overlay" onClick={() => setViewingBanner(null)}>
          <div className="banner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="banner-modal-header">
              <h3>Banner Details</h3>
              <button onClick={() => setViewingBanner(null)}><X size={18} /></button>
            </div>

            <img src={viewingBanner.image} alt="" className="banner-modal-image" />

            <div className="banner-modal-grid">
              <div>
                <strong>Type</strong>
                <p>{viewingBanner.type}</p>
              </div>
              <div>
                <strong>Redirect Link</strong>
                <p>{viewingBanner.link}</p>
              </div>
              <div>
                <strong>Start Date</strong>
                <p>{viewingBanner.startDate}</p>
              </div>
              <div>
                <strong>End Date</strong>
                <p>{viewingBanner.endDate}</p>
              </div>
              <div>
                <strong>Created At</strong>
                <p>{viewingBanner.createdAt}</p>
              </div>
              <div>
                <strong>Updated At</strong>
                <p>{viewingBanner.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
