import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./AboutEditor.css";

const emptyForm = {
  label: "ABOUT OUR COMPANY",
  heading: "",
  paragraph1: "",
  paragraph2: "",
};

export default function AboutEditor() {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState({ image1: null, image2: null });
  const [currentImages, setCurrentImages] = useState({ image1: "", image2: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/about-section").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "ABOUT OUR COMPANY",
          heading: res.data.heading || "",
          paragraph1: res.data.paragraph1 || "",
          paragraph2: res.data.paragraph2 || "",
        });
        setCurrentImages({
          image1: res.data.image1 || "",
          image2: res.data.image2 || "",
        });
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
    if (files.image1) data.append("image1", files.image1);
    if (files.image2) data.append("image2", files.image2);

    try {
      await api.put("/about-section", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="about-editor-loading">Loading...</p>;

  return (
    <div className="about-editor">
      <h1 className="about-editor-title">About Section</h1>
      <p className="about-editor-sub">This content appears on the homepage About block</p>

      <form className="about-editor-form" onSubmit={handleSubmit}>
        <label>Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="ABOUT OUR COMPANY"
        />

        <label>Heading</label>
        <textarea
          rows={3}
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          placeholder="Bhrosa Cab: Your trusted partner for..."
        />

        <label>Paragraph 1</label>
        <textarea
          rows={2}
          value={form.paragraph1}
          onChange={(e) => setForm({ ...form, paragraph1: e.target.value })}
        />

        <label>Paragraph 2</label>
        <textarea
          rows={2}
          value={form.paragraph2}
          onChange={(e) => setForm({ ...form, paragraph2: e.target.value })}
        />

        <label>Image 1 (top image)</label>
        {currentImages.image1 && !files.image1 && (
          <img
            src={`${SERVER_URL}${currentImages.image1}`}
            alt=""
            className="about-editor-preview"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFiles({ ...files, image1: e.target.files[0] })}
        />

        <label>Image 2 (bottom image)</label>
        {currentImages.image2 && !files.image2 && (
          <img
            src={`${SERVER_URL}${currentImages.image2}`}
            alt=""
            className="about-editor-preview"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFiles({ ...files, image2: e.target.files[0] })}
        />

        <button type="submit" className="about-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}