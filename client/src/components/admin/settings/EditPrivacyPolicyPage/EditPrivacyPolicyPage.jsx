import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditPrivacyPolicyPage.css";

export default function EditPrivacyPolicyPage() {
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
        const res = await api.get(`/settings/privacy-policy/${id}`);
        if (res.data && res.data.data) {
          setTitle(res.data.data.title || "");
          setDescription(res.data.data.description || "");
        }
      } catch (err) {
        console.error("Failed to load privacy policy clause:", err);
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
      const res = await api.put(`/settings/privacy-policy/${id}`, {
        title: title.trim(),
        description: description.trim(),
      });
      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/settings/privacy-policy");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update privacy policy clause:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update clause");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/settings/privacy-policy");
  }

  return (
    <div className="edit-policy-page">
      <div className="edit-policy-topbar">
        <button className="edit-policy-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Privacy Policy</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-policy-alert-success">
          <CheckCircle2 size={18} />
          <span>Privacy policy clause <strong>{title}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-policy-card">
        <div className="edit-policy-card-header">
          <div className="edit-policy-header-icon">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="edit-policy-card-title">Edit Privacy Policy</h3>
            <p className="edit-policy-card-subtitle">
              Update legal privacy clause title &amp; description content for #{id}
            </p>
          </div>
        </div>

        <div className="edit-policy-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-policy-form-group">
              <label>
                Clause Title <span className="edit-policy-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Account and Security, Cookies Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-policy-form-group">
              <label>
                Clause Content / Description <span className="edit-policy-req">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Enter complete policy wording..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-policy-actions">
              <button
                type="submit"
                className="edit-policy-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Policy"}
              </button>
              <button
                type="button"
                className="edit-policy-btn-cancel"
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
