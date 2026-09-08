import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./FranchiseBannerEditor.css";

const emptyForm = { label: "Benefits Bhrosa Cab", heading: "" };

export default function FranchiseBannerEditor() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/franchise-banner").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "Benefits Bhrosa Cab",
          heading: res.data.heading || "",
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
      await api.put("/franchise-banner", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="franchise-banner-editor-loading">Loading...</p>;

  return (
    <div className="franchise-banner-editor">
      <h1 className="franchise-banner-editor-title">Franchise Page — Banner</h1>
      <p className="franchise-banner-editor-sub">This content appears at the top of the Franchise page</p>

      <form className="franchise-banner-editor-form" onSubmit={handleSubmit}>
        <label>Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />

        <label>Heading</label>
        <input
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          placeholder="FRANCHISEE"
        />

        <button type="submit" className="franchise-banner-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}