import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./AboutCompanyEditor.css";

const emptyForm = {
  label: "About Our Company",
  heading: "",
  paragraph1: "",
  paragraph2: "",
  videoLink: "",
};

export default function AboutCompanyEditor() {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState({ backImage: null, frontImage: null });
  const [currentImages, setCurrentImages] = useState({ backImage: "", frontImage: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/about-company").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "About Our Company",
          heading: res.data.heading || "",
          paragraph1: res.data.paragraph1 || "",
          paragraph2: res.data.paragraph2 || "",
          videoLink: res.data.videoLink || "",
        });
        setCurrentImages({
          backImage: res.data.backImage || "",
          frontImage: res.data.frontImage || "",
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
    if (files.backImage) data.append("backImage", files.backImage);
    if (files.frontImage) data.append("frontImage", files.frontImage);

    try {
      await api.put("/about-company", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="about-company-editor-loading">Loading...</p>;

  return (
    <div className="about-company-editor">
      <h1 className="about-company-editor-title">About Page — Company Section</h1>
      <p className="about-company-editor-sub">This content appears in the About Company block</p>

      <form className="about-company-editor-form" onSubmit={handleSubmit}>
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
          placeholder={"Bhrosa Cab: Your trusted partner for safe,\naffordable, and comfortable travel anytime, anywhere."}
        />
        <p className="about-company-field-hint">Press Enter for a line break</p>

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

        <label>Video / Play Button Link</label>
        <input
          value={form.videoLink}
          onChange={(e) => setForm({ ...form, videoLink: e.target.value })}
          placeholder="https://www.instagram.com/p/..."
        />

        <label>Back Image</label>
        {currentImages.backImage && !files.backImage && (
          <img
            src={`${SERVER_URL}${currentImages.backImage}`}
            alt=""
            className="about-company-editor-preview"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFiles({ ...files, backImage: e.target.files[0] })}
        />
        {currentImages.backImage && !files.backImage && (
          <p className="about-company-field-hint">Existing image will be kept if you don't choose a new one</p>
        )}

        <label>Front Image</label>
        {currentImages.frontImage && !files.frontImage && (
          <img
            src={`${SERVER_URL}${currentImages.frontImage}`}
            alt=""
            className="about-company-editor-preview"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFiles({ ...files, frontImage: e.target.files[0] })}
        />
        {currentImages.frontImage && !files.frontImage && (
          <p className="about-company-field-hint">Existing image will be kept if you don't choose a new one</p>
        )}

        <button type="submit" className="about-company-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}