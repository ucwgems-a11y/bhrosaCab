import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditAboutUsPage.css";

export default function EditAboutUsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const res = await api.get(`/settings/about-us/${id}`);
        if (res.data && res.data.data) {
          setTitle(res.data.data.title || "");
          setDescription(res.data.data.description || "");
        }
      } catch (err) {
        console.error("Failed to load about us clause:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadItem();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/settings/about-us/${id}`, {
        title: title.trim(),
        description: description.trim(),
      });
      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/settings/about-us");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update about us clause:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update clause");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/settings/about-us");
  }

  return (
    <div className="edit-about-page">
      <div className="edit-about-topbar">
        <button className="edit-about-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to About Us</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-about-alert-success">
          <CheckCircle2 size={18} />
          <span>About Us clause <strong>{title}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-about-card">
        <div className="edit-about-card-header">
          <div className="edit-about-header-icon">
            <Info size={20} />
          </div>
          <div>
            <h3 className="edit-about-card-title">Edit About Us</h3>
            <p className="edit-about-card-subtitle">
              Update company story, mission &amp; information clause for #{id}
            </p>
          </div>
        </div>

        <div className="edit-about-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-about-form-group">
              <label>
                Section / Story Title <span className="edit-about-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Our Mission, Why Ride With Us"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-about-form-group">
              <label>
                Story Content / Description <span className="edit-about-req">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Enter complete about details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-about-actions">
              <button
                type="submit"
                className="edit-about-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update About Us"}
              </button>
              <button
                type="button"
                className="edit-about-btn-cancel"
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
