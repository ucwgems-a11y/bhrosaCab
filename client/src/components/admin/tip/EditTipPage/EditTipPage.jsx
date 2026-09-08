import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditTipPage.css";

export default function EditTipPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchTipDetails() {
      setLoading(true);
      try {
        const res = await api.get(`/tips/${id}`);
        if (res.data && res.data.tip) {
          setAmount(res.data.tip.amount);
        }
      } catch (err) {
        console.error("Failed to fetch tip details:", err);
        showErrorAlert("Failed to load tip details");
      } finally {
        setLoading(false);
      }
    }
    fetchTipDetails();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!amount) return;
    setSubmitting(true);

    try {
      await api.put(`/tips/${id}`, { amount: Number(amount) });
      setShowSuccess(true);
      showSuccessAlert("Tip amount updated successfully!", 1200);
      setTimeout(() => {
        navigate("/admin/tip/manage");
      }, 1000);
    } catch (err) {
      console.error("Failed to update tip:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update tip amount");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/tip/manage");
  }

  return (
    <div className="edit-tip-page">
      <div className="edit-tip-topbar">
        <button className="edit-tip-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Manage Tip</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-tip-alert-success">
          <CheckCircle2 size={18} />
          <span>Tip amount updated to <strong>₹{amount}</strong> successfully!</span>
        </div>
      )}

      <div className="edit-tip-card">
        <div className="edit-tip-card-header">
          <div className="edit-tip-header-icon">
            <Coins size={20} />
          </div>
          <div>
            <h3 className="edit-tip-card-title">Edit Tip-Amount</h3>
            <p className="edit-tip-card-subtitle">
              Update tip denomination for Tip Option #{id}
            </p>
          </div>
        </div>

        <div className="edit-tip-card-body">
          {loading ? (
            <div style={{ color: "var(--text-muted)", padding: "20px" }}>Loading tip details...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="edit-tip-form-group">
                <label>
                  Tip-amount (₹) <span className="edit-tip-req">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="edit-tip-actions">
                <button
                  type="submit"
                  className="edit-tip-btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Tip"}
                </button>
                <button
                  type="button"
                  className="edit-tip-btn-cancel"
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
