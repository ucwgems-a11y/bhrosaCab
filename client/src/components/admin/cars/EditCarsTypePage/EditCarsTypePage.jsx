import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Layers, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditCarsTypePage.css";

export default function EditCarsTypePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [typeName, setTypeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadType() {
      setLoading(true);
      try {
        const res = await api.get(`/cars/types/${id}`);
        if (res.data && res.data.type) {
          setTypeName(res.data.type.name || res.data.type.typeName || "");
        }
      } catch (err) {
        console.error("Failed to load vehicle type:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadType();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!typeName.trim()) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/cars/types/${id}`, { typeName: typeName.trim() });
      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/cars/type");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update vehicle type:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update vehicle type");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/cars/type");
  }

  return (
    <div className="edit-type-page">
      {/* Back Button */}
      <div className="edit-type-topbar">
        <button className="edit-type-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Manage Cars Type</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-type-alert-success">
          <CheckCircle2 size={18} />
          <span>Vehicle Type <strong>{typeName}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-type-card">
        <div className="edit-type-card-header">
          <div className="edit-type-header-icon">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="edit-type-card-title">Edit Vehicle Type</h3>
            <p className="edit-type-card-subtitle">
              Update category name for Vehicle ID #{id}
            </p>
          </div>
        </div>

        <div className="edit-type-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-type-form-group">
              <label>
                Vehicle Type Name <span className="edit-type-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Sedan, Hatchback"
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-type-actions">
              <button
                type="submit"
                className="edit-type-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Vehicle Type"}
              </button>
              <button
                type="button"
                className="edit-type-btn-cancel"
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
