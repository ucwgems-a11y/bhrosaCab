import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditTermsConditionsPage.css";

export default function EditTermsConditionsPage() {
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
        const res = await api.get(`/settings/terms/${id}`);
        if (res.data && res.data.data) {
          setTitle(res.data.data.title || "");
          setDescription(res.data.data.description || "");
        }
      } catch (err) {
        console.error("Failed to load terms & conditions clause:", err);
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
      const res = await api.put(`/settings/terms/${id}`, {
        title: title.trim(),
        description: description.trim(),
      });
      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/settings/terms");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update terms clause:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update clause");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/settings/terms");
  }

  return (
    <div className="edit-terms-page">
      <div className="edit-terms-topbar">
        <button className="edit-terms-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Terms &amp; Conditions</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-terms-alert-success">
          <CheckCircle2 size={18} />
          <span>Terms &amp; conditions clause <strong>{title}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-terms-card">
        <div className="edit-terms-card-header">
          <div className="edit-terms-header-icon">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="edit-terms-card-title">Edit Terms &amp; Conditions</h3>
            <p className="edit-terms-card-subtitle">
              Update legal terms clause title &amp; conditions wording for #{id}
            </p>
          </div>
        </div>

        <div className="edit-terms-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-terms-form-group">
              <label>
                Clause Title <span className="edit-terms-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. User Obligations, Payment Policy"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-terms-form-group">
              <label>
                Clause Content / Terms Wording <span className="edit-terms-req">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Enter complete terms wording..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-terms-actions">
              <button
                type="submit"
                className="edit-terms-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Terms"}
              </button>
              <button
                type="button"
                className="edit-terms-btn-cancel"
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
