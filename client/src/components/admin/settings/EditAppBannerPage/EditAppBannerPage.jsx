import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditAppBannerPage.css";

const bannerTypes = [
  { value: "1", label: "Home Screen" },
  { value: "2", label: "Ride Top Screen" },
  { value: "3", label: "Ride Footer Screen" },
];

export default function EditAppBannerPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [type, setType] = useState("1");
  const [link, setLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadBanner() {
      setLoading(true);
      try {
        const res = await api.get(`/settings/app-banners/${id}`);
        if (res.data && res.data.data) {
          const b = res.data.data;
          setType(b.type || "1");
          setLink(b.link || "");
          setStartDate(b.startDate || "");
          setEndDate(b.endDate || "");
          if (b.image) setPreviewUrl(b.image);
        }
      } catch (err) {
        console.error("Failed to load banner details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadBanner();
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!type || !startDate || !endDate) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("link", link || "");
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      if (selectedFile) formData.append("image", selectedFile);

      const res = await api.put(`/settings/app-banners/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/settings/app-banner");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update banner:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update app banner");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/settings/app-banner");
  }

  return (
    <div className="edit-banner-page">
      <div className="edit-banner-topbar">
        <button className="edit-banner-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to App Banners</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-banner-alert-success">
          <CheckCircle2 size={18} />
          <span>App Banner updated successfully!</span>
        </div>
      )}

      <div className="edit-banner-card">
        <div className="edit-banner-card-header">
          <div className="edit-banner-header-icon">
            <ImageIcon size={20} />
          </div>
          <div>
            <h3 className="edit-banner-card-title">Edit App Banner</h3>
            <p className="edit-banner-card-subtitle">
              Update promotional banner display configuration for #{id}
            </p>
          </div>
        </div>

        <div className="edit-banner-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-banner-form-grid">
              <div className="edit-banner-form-group">
                <label>
                  Display Screen Type <span className="edit-banner-req">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select Screen Type</option>
                  {bannerTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="edit-banner-form-group">
                <label>Redirect Link</label>
                <input
                  type="url"
                  placeholder="https://bhrosacab.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="edit-banner-form-group">
                <label>
                  Start Date <span className="edit-banner-req">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-banner-form-group">
                <label>
                  End Date <span className="edit-banner-req">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-banner-form-group edit-banner-full-width">
                <label>Banner Graphic Preview &amp; Upload</label>
                <div className="edit-banner-preview-wrap">
                  {previewUrl && (
                    <div className="edit-banner-preview-box">
                      <img src={previewUrl} alt="App Banner Preview" />
                    </div>
                  )}
                  <label className="edit-banner-upload-btn">
                    <Upload size={16} />
                    <span>Upload New Banner Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="edit-banner-actions">
              <button
                type="submit"
                className="edit-banner-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Banner"}
              </button>
              <button
                type="button"
                className="edit-banner-btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
