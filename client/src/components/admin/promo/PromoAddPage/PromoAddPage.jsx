import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "../promoShared.css";

export default function PromoAddPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    promoCode: "",
    discount: "",
    startDate: "",
    endDate: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.promoCode.trim() || !form.discount || !form.startDate || !form.endDate) {
      showErrorAlert("Please fill all required fields");
      return;
    }
    setSubmitting(true);

    try {
      const res = await api.post("/promos", {
        code: form.promoCode.trim(),
        title: form.title.trim(),
        discount: Number(form.discount),
        startDate: form.startDate,
        endDate: form.endDate,
      });

      if (res.data && res.data.success) {
        showSuccessAlert("Promo coupon saved successfully!", 1000);
        setTimeout(() => {
          navigate("/admin/promo/manage");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to save promo:", err);
      showErrorAlert(err.response?.data?.message || "Failed to save promo coupon");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/promo/manage")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--card-bg, #1a222d)",
            color: "var(--text-main, #fff)",
            border: "1px solid var(--border-color, #2a3441)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Promo Coupons</span>
        </button>
      </div>

      <h1 className="data-page-title">Promo Add</h1>

      <form className="form-card" onSubmit={handleSubmit}>
        <label htmlFor="title">Title <span style={{ color: "#ef4444" }}>*</span></label>
        <input
          id="title"
          name="title"
          type="text"
          placeholder="e.g. Special festive discount"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="promo_code">Promo Code <span style={{ color: "#ef4444" }}>*</span></label>
        <input
          id="promo_code"
          name="promoCode"
          type="text"
          placeholder="e.g. WELCOME50"
          value={form.promoCode}
          onChange={(e) => setForm({ ...form, promoCode: e.target.value.toUpperCase() })}
          style={{ textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}
          required
        />

        <label htmlFor="discount">Discount (%) <span style={{ color: "#ef4444" }}>*</span></label>
        <input
          id="discount"
          name="discount"
          type="number"
          min="1"
          max="100"
          placeholder="e.g. 20"
          value={form.discount}
          onChange={handleChange}
          required
        />

        <label htmlFor="startDate">Start Date <span style={{ color: "#ef4444" }}>*</span></label>
        <input
          id="startDate"
          name="startDate"
          type="date"
          value={form.startDate}
          onChange={handleChange}
          required
        />

        <label htmlFor="endDate">End Date <span style={{ color: "#ef4444" }}>*</span></label>
        <input
          id="endDate"
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          required
        />

        <button type="submit" className="form-submit-btn" disabled={submitting}>
          {submitting ? "Saving..." : "Save Promo"}
        </button>
      </form>
    </div>
  );
}
