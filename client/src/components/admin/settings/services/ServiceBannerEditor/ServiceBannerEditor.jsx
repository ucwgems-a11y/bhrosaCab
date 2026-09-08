import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./ServiceBannerEditor.css";

const emptyForm = {
  label: "OUR SERVICES!",
  heading: "",
  highlight: "",
  description: "",
};

export default function ServiceBannerEditor() {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/service-banner").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "OUR SERVICES!",
          heading: res.data.heading || "",
          highlight: res.data.highlight || "",
          description: res.data.description || "",
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
      await api.put("/service-banner", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="service-banner-editor-loading">Loading...</p>;

  return (
    <div className="service-banner-editor">
      <h1 className="service-banner-editor-title">Services Page — Banner</h1>
      <p className="service-banner-editor-sub">This content appears at the top of the Services page</p>

      <form className="service-banner-editor-form" onSubmit={handleSubmit}>
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
          placeholder={"Journey Safely,\nArrive Confidently!"}
        />
        <p className="service-banner-field-hint">
          Press Enter for a line break. Then copy the exact highlighted line into the field below.
        </p>

        <label>Highlighted Line (optional)</label>
        <input
          value={form.highlight}
          onChange={(e) => setForm({ ...form, highlight: e.target.value })}
          placeholder="Arrive Confidently!"
        />

        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder={"Everything your taxi business\nneeds is already here!"}
        />
        <p className="service-banner-field-hint">Press Enter for a line break</p>

        <label>Background Image (optional)</label>
        {currentImage && !file && (
          <img
            src={`${SERVER_URL}${currentImage}`}
            alt=""
            className="service-banner-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <p className="service-banner-field-hint">Leave empty to use the default banner image</p>

        <button type="submit" className="service-banner-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}