import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../../api/axios";
import "./CompanyInfoEditor.css";

const emptyForm = { phone: "", email: "", address: "" };

export default function CompanyInfoEditor() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/company-info").then((res) => {
      if (res.data) {
        setForm({
          phone: res.data.phone || "",
          email: res.data.email || "",
          address: res.data.address || "",
        });
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/company-info", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="company-info-editor-loading">Loading...</p>;

  return (
    <div className="company-info-editor">
      <button
        className="company-info-back-btn"
        onClick={() => navigate("/admin/settings/website")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "none",
          color: "var(--text-muted, #8b9bb4)",
          fontSize: "13px",
          cursor: "pointer",
          marginBottom: "16px",
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="company-info-editor-title">Company Contact Info</h1>
      <p className="company-info-editor-sub">
        This phone number, email, and address are shared across the Header, Footer, and Contact page.
        Update it here once and it changes everywhere on the website.
      </p>

      <form className="company-info-editor-form" onSubmit={handleSubmit}>
        <label>Phone Number</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+91-9115513232"
          required
        />

        <label>Email</label>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="support@bhrosacabs.com"
          required
        />

        <label>Address</label>
        <textarea
          rows={3}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder={"Aviva Building, JP Infra,\nVinay Nagar, Mira Road, Mumbai."}
          required
        />
        <p className="company-info-field-hint">Press Enter for a line break</p>

        <button type="submit" className="company-info-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}