import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./WhyChooseEditor.css";

const emptyForm = {
  label: "THE BHROSA CAB ADVANTAGE",
  heading: "",
  description: "",
  buttonText: "📲 Download App",
  buttonLink: "",
  showBackgroundMap: true,
};

export default function WhyChooseEditor() {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/why-choose-left").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "THE BHROSA CAB ADVANTAGE",
          heading: res.data.heading || "",
          description: res.data.description || "",
          buttonText: res.data.buttonText || "📲 Download App",
          buttonLink: res.data.buttonLink || "",
          showBackgroundMap: res.data.showBackgroundMap ?? true,
        });
        setCurrentImage(res.data.backgroundImage || "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (file) data.append("backgroundImage", file);

    try {
      await api.put("/why-choose-left", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="why-editor-loading">Loading...</p>;

  return (
    <div className="why-editor">
      <h1 className="why-editor-title">Why Choose Section — Left Side</h1>
      <p className="why-editor-sub">
        Only the left column is editable here. The right column (Why Ride list) stays fixed.
      </p>

      <form className="why-editor-form" onSubmit={handleSubmit}>
        <label>Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />

        <label>Heading</label>
        <textarea
          rows={2}
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          placeholder="Unmatched features for&#10;peace of mind"
        />
        <p className="why-field-hint">Press Enter for a line break, same as the title on the website</p>

        <label>Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Button Text</label>
        <input
          value={form.buttonText}
          onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
        />

        <label>Button Link</label>
        <input
          value={form.buttonLink}
          onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
          placeholder="https://play.google.com/store/apps/details?id=..."
        />

        <label className="why-checkbox-label">
          <input
            type="checkbox"
            checked={form.showBackgroundMap}
            onChange={(e) => setForm({ ...form, showBackgroundMap: e.target.checked })}
          />
          Show background world-map graphic
        </label>

        <label>Custom Background Image (optional)</label>
        {currentImage && !file && (
          <img
            src={`${SERVER_URL}${currentImage}`}
            alt=""
            className="why-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <p className="why-field-hint">
          Leave empty to use the default world-map graphic
        </p>

        <button type="submit" className="why-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}