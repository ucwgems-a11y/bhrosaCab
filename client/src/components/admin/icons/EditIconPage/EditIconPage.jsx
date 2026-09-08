import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditIconPage.css";

export default function EditIconPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("⭐");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadIcon() {
      setLoading(true);
      try {
        const res = await api.get(`/icons/${id}`);
        if (res.data && res.data.data) {
          const d = res.data.data;
          setName(d.name || "");
          setIcon(d.icon || "⭐");
          if (d.image) setPreviewUrl(d.image);
        }
      } catch (err) {
        console.error("Failed to load icon details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadIcon();
  }, [id]);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
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

      const res = await api.put(`/icons/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/icons/add");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update icon:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update icon");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/icons/add");
  }

  return (
    <div className="edit-icon-page">
      {/* Topbar Back Navigation */}
      <div className="edit-icon-topbar">
        <button className="edit-icon-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Manage Icons</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-icon-alert-success">
          <CheckCircle2 size={18} />
          <span>Icon <strong>{name}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-icon-card">
        <div className="edit-icon-card-header">
          <div className="edit-icon-header-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="edit-icon-card-title">Edit App Icon</h3>
            <p className="edit-icon-card-subtitle">
              Update UI symbol label &amp; graphic asset for #{id}
            </p>
          </div>
        </div>

        <div className="edit-icon-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-icon-form-group">
              <label>
                Icon Name <span className="edit-icon-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Dollar, Coupon, Taxi Service"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-icon-form-group">
              <label>Icon Graphic / Asset</label>
              <div className="edit-icon-image-row">
                <div className="edit-icon-preview-box">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Icon Preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: "28px" }}>{icon}</span>
                  )}
                </div>
                <label className="edit-icon-upload-btn">
                  <Upload size={16} />
                  <span>Choose Icon Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div className="edit-icon-actions">
              <button
                type="submit"
                className="edit-icon-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Icon"}
              </button>
              <button
                type="button"
                className="edit-icon-btn-cancel"
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
