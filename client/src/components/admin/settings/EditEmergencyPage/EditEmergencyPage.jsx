import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditEmergencyPage.css";

export default function EditEmergencyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadItem() {
      setLoading(true);
      try {
        const res = await api.get(`/settings/emergency/${id}`);
        if (res.data && res.data.data) {
          setName(res.data.data.name || "");
          setNumber(res.data.data.number || "");
        }
      } catch (err) {
        console.error("Failed to load emergency details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadItem();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !number.trim()) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/settings/emergency/${id}`, {
        name: name.trim(),
        number: number.trim(),
      });
      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/settings/emergency");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update emergency number:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update emergency number");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/settings/emergency");
  }

  return (
    <div className="edit-emergency-page">
      <div className="edit-emergency-topbar">
        <button className="edit-emergency-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Emergency Numbers</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-emergency-alert-success">
          <CheckCircle2 size={18} />
          <span>Emergency contact <strong>{name} ({number})</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-emergency-card">
        <div className="edit-emergency-card-header">
          <div className="edit-emergency-header-icon">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="edit-emergency-card-title">Edit Emergency Number</h3>
            <p className="edit-emergency-card-subtitle">
              Update emergency helpline name &amp; phone number for #{id}
            </p>
          </div>
        </div>

        <div className="edit-emergency-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-emergency-form-group">
              <label>
                Service / Authority Name <span className="edit-emergency-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Police, Ambulance, Fire Helpline"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-emergency-form-group">
              <label>
                Emergency Phone Number <span className="edit-emergency-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 100, 108, 112"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-emergency-actions">
              <button
                type="submit"
                className="edit-emergency-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Emergency Number"}
              </button>
              <button
                type="button"
                className="edit-emergency-btn-cancel"
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
