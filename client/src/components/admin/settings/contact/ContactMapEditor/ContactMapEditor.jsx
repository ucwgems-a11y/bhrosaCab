import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./ContactMapEditor.css";

export default function ContactMapEditor() {
  const [mapEmbedUrl, setMapEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/contact-map").then((res) => {
      if (res.data) {
        setMapEmbedUrl(res.data.mapEmbedUrl || "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/contact-map", { mapEmbedUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="contact-map-editor-loading">Loading...</p>;

  return (
    <div className="contact-map-editor">
      <h1 className="contact-map-editor-title">Contact Page — Map</h1>
      <p className="contact-map-editor-sub">This map appears on the Contact page</p>

      <form className="contact-map-editor-form" onSubmit={handleSubmit}>
        <label>Google Maps Embed Link</label>
        <textarea
          rows={3}
          value={mapEmbedUrl}
          onChange={(e) => setMapEmbedUrl(e.target.value)}
          placeholder="https://www.google.com/maps?q=..."
        />
        <p className="contact-map-field-hint">
          Go to Google Maps → search your location → Share → Embed a map → copy only the URL from{" "}
          <code>src="..."</code> and paste it here
        </p>

        <button type="submit" className="contact-map-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}