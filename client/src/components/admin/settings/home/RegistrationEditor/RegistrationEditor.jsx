import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./RegistrationEditor.css";

const emptyForm = { heading: "Register Now", description: "" };

export default function RegistrationEditor() {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/registration-section").then((res) => {
      if (res.data) {
        setForm({
          heading: res.data.heading || "Register Now",
          description: res.data.description || "",
        });
        setCurrentImage(res.data.image || "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const data = new FormData();
    data.append("heading", form.heading);
    data.append("description", form.description);
    if (file) data.append("image", file);

    try {
      await api.put("/registration-section", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="registration-editor-loading">Loading...</p>;

  return (
    <div className="registration-editor">
      <h1 className="registration-editor-title">Registration Section</h1>
      <p className="registration-editor-sub">
        This content appears on the homepage call-to-action block
      </p>

      <form className="registration-editor-form" onSubmit={handleSubmit}>
        <label>Heading</label>
        <input
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
        />

        <label>Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Bhrosa Cab for reliable, safe, and convenient transportation..."
        />

        <label>Image</label>
        {currentImage && !file && (
          <img
            src={`${SERVER_URL}${currentImage}`}
            alt=""
            className="registration-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {currentImage && !file && (
          <p className="registration-field-hint">
            Existing image will be kept if you don't choose a new one
          </p>
        )}

        <button type="submit" className="registration-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}