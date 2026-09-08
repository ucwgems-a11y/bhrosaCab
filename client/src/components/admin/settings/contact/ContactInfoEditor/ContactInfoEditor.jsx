import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../../../api/axios";
import "./ContactInfoEditor.css";

const emptyForm = {
  heading: "Have Any Questions?",
  highlight: "Questions?",
  description: "",
  companyName: "Bhrosa Group",
  workingHours: "",
};

export default function ContactInfoEditor() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/contact-info").then((res) => {
      if (res.data) {
        setForm({
          heading: res.data.heading || "Have Any Questions?",
          highlight: res.data.highlight || "Questions?",
          description: res.data.description || "",
          companyName: res.data.companyName || "Bhrosa Group",
          workingHours: res.data.workingHours || "",
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
      await api.put("/contact-info", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="contact-info-editor-loading">Loading...</p>;

  return (
    <div className="contact-info-editor">
      <button
        className="contact-info-back-btn"
        onClick={() => navigate("/admin/settings/website/contact")}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="contact-info-editor-title">Contact Page — Info</h1>
      <p className="contact-info-editor-sub">
        This content appears on the left side of the Contact page. Phone, email, and address are
        managed from Company Info (Settings → Bhrosa Cab Website → Company Info).
      </p>

      <form className="contact-info-editor-form" onSubmit={handleSubmit}>
        <label>Heading</label>
        <input
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
        />

        <label>Highlighted Word (optional)</label>
        <input
          value={form.highlight}
          onChange={(e) => setForm({ ...form, highlight: e.target.value })}
          placeholder="Questions?"
        />

        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Company Name</label>
        <input
          value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        />

        <label>Working Hours</label>
        <input
          value={form.workingHours}
          onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
          placeholder="Working Hours (10:00 AM – 7:00 PM)"
        />

        <button type="submit" className="contact-info-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}