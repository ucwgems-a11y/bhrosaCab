import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, XCircle, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditCancelReasonPage.css";

export default function EditCancelReasonPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchReasonDetails() {
      setLoading(true);
      try {
        const res = await api.get(`/cancel-reasons/${id}`);
        if (res.data && res.data.reason) {
          setReason(res.data.reason.reason);
        }
      } catch (err) {
        console.error("Failed to fetch cancel reason details:", err);
        showErrorAlert("Failed to load cancel reason details");
      } finally {
        setLoading(false);
      }
    }
    fetchReasonDetails();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) return;
    setSubmitting(true);

    try {
      await api.put(`/cancel-reasons/${id}`, { reason: reason.trim() });
      setShowSuccess(true);
      showSuccessAlert("Cancel reason updated successfully!", 1200);
      setTimeout(() => {
        navigate("/admin/cancel-reason/manage");
      }, 1000);
    } catch (err) {
      console.error("Failed to update cancel reason:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update cancel reason");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/cancel-reason/manage");
  }

  return (
    <div className="edit-cancel-reason-page">
      <div className="edit-cancel-reason-topbar">
        <button className="edit-cancel-reason-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Cancel Reasons</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-cancel-reason-alert-success">
          <CheckCircle2 size={18} />
          <span>Cancel reason updated successfully!</span>
        </div>
      )}

      <div className="edit-cancel-reason-card">
        <div className="edit-cancel-reason-card-header">
          <div className="edit-cancel-reason-header-icon">
            <XCircle size={20} />
          </div>
          <div>
            <h3 className="edit-cancel-reason-card-title">Edit Cancel Reason</h3>
            <p className="edit-cancel-reason-card-subtitle">
              Update cancellation reason text for Reason #{id}
            </p>
          </div>
        </div>

        <div className="edit-cancel-reason-card-body">
          {loading ? (
            <div style={{ color: "var(--text-muted)", padding: "20px" }}>Loading reason details...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="edit-cancel-reason-form-group">
                <label>
                  Reason Text <span className="edit-cancel-reason-req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter cancellation reason..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>

              <div className="edit-cancel-reason-actions">
                <button
                  type="submit"
                  className="edit-cancel-reason-btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Reason"}
                </button>
                <button
                  type="button"
                  className="edit-cancel-reason-btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
