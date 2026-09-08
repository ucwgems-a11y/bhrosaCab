import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Tag, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./PromoEditPage.css";

export default function PromoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState("");
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadPromo() {
      setLoading(true);
      try {
        const res = await api.get(`/promos/${id}`);
        if (res.data && res.data.data) {
          const p = res.data.data;
          setPromoCode(p.code || "");
          setTitle(p.title || "");
          setDiscount(p.rawDiscount || p.discount || "");
          setStartDate(p.startDate || "");
          setEndDate(p.endDate || "");
        }
      } catch (err) {
        console.error("Failed to load promo:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadPromo();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!promoCode.trim() || !title.trim() || !discount || !startDate || !endDate) {
      showErrorAlert("Please fill all required fields");
      return;
    }
    setSubmitting(true);

    try {
      const res = await api.put(`/promos/${id}`, {
        code: promoCode.trim(),
        title: title.trim(),
        discount: Number(discount),
        startDate,
        endDate,
      });

      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/promo/manage");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update promo:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update promo coupon");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/promo/manage");
  }

  return (
    <div className="edit-promo-page">
      {/* Topbar Back Navigation */}
      <div className="edit-promo-topbar">
        <button className="edit-promo-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Promo Codes</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-promo-alert-success">
          <CheckCircle2 size={18} />
          <span>Promo code <strong>{promoCode}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-promo-card">
        <div className="edit-promo-card-header">
          <div className="edit-promo-header-icon">
            <Tag size={20} />
          </div>
          <div>
            <h3 className="edit-promo-card-title">Edit Promo Code</h3>
            <p className="edit-promo-card-subtitle">
              Update discount percentage, description &amp; validity dates for #{id}
            </p>
          </div>
        </div>

        <div className="edit-promo-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-promo-form-grid">
              <div className="edit-promo-form-group">
                <label>
                  Promo Coupon Code <span className="edit-promo-req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. WELCOME50, FESTIVE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-promo-form-group">
                <label>
                  Discount Percentage (%) <span className="edit-promo-req">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  placeholder="e.g. 20"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-promo-form-group edit-promo-full-width">
                <label>
                  Promo Description / Title <span className="edit-promo-req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20% discount on first 5 intercity rides"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-promo-form-group">
                <label>
                  Start Validity Date <span className="edit-promo-req">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="edit-promo-form-group">
                <label>
                  End Expiry Date <span className="edit-promo-req">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="edit-promo-actions">
              <button
                type="submit"
                className="edit-promo-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Promo Code"}
              </button>
              <button
                type="button"
                className="edit-promo-btn-cancel"
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
