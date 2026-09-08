import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./AboutBannerEditor.css";

const emptyForm = {
  label: "About Company!",
  heading: "",
  highlight: "",
  description: "",
};

export default function AboutBannerEditor() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/about-banner").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "About Company!",
          heading: res.data.heading || "",
          highlight: res.data.highlight || "",
          description: res.data.description || "",
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
      await api.put("/about-banner", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="about-banner-editor-loading">Loading...</p>;

  return (
    <div className="about-banner-editor">
      <h1 className="about-banner-editor-title">About Page — Banner</h1>
      <p className="about-banner-editor-sub">This content appears at the top of the About Us page</p>

      <form className="about-banner-editor-form" onSubmit={handleSubmit}>
        <label>Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />

        <label>Heading</label>
        <textarea
          rows={3}
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          placeholder={"Feel your journey\nwith Bhrosa Cab!"}
        />
        <p className="about-banner-field-hint">
          Press Enter for a line break. Then copy the exact highlighted part (e.g. "Bhrosa Cab!") into the field below.
        </p>

        <label>Highlighted Word/Phrase (optional)</label>
        <input
          value={form.highlight}
          onChange={(e) => setForm({ ...form, highlight: e.target.value })}
          placeholder="Bhrosa Cab!"
        />

        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={"Everything your taxi business\nneeds is already here!"}
        />
        <p className="about-banner-field-hint">Press Enter for a line break</p>

        <button type="submit" className="about-banner-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}