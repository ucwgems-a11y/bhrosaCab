import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../../../../api/axios";
import "./DownloadSectionEditor.css";

const emptyForm = {
  label: "ONLINE BOOKING",
  title: "",
  description: "",
  downloadLink: "",
};

export default function DownloadSectionEditor() {
  const [form, setForm] = useState(emptyForm);
  const [features, setFeatures] = useState([]);
  const [featureIconFiles, setFeatureIconFiles] = useState({}); // { 0: File, 1: File, ... }
  const [files, setFiles] = useState({ mobileImage: null, markerImage: null });
  const [currentImages, setCurrentImages] = useState({ mobileImage: "", markerImage: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/download-section").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "ONLINE BOOKING",
          title: res.data.title || "",
          description: res.data.description || "",
          downloadLink: res.data.downloadLink || "",
        });
        setFeatures(res.data.features || []);
        setCurrentImages({
          mobileImage: res.data.mobileImage || "",
          markerImage: res.data.markerImage || "",
        });
      }
      setLoading(false);
    });
  }, []);

  function addFeature() {
    if (features.length >= 3) return; // max 3 allowed
    setFeatures([...features, { title: "", subtitle: "", icon: "" }]);
  }

  function updateFeature(index, key, value) {
    const updated = [...features];
    updated[index][key] = value;
    setFeatures(updated);
  }

  function updateFeatureIcon(index, file) {
    setFeatureIconFiles({ ...featureIconFiles, [index]: file });
  }

  function removeFeature(index) {
    setFeatures(features.filter((_, i) => i !== index));
    const updatedIcons = { ...featureIconFiles };
    delete updatedIcons[index];
    setFeatureIconFiles(updatedIcons);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("features", JSON.stringify(features));
    if (files.mobileImage) data.append("mobileImage", files.mobileImage);
    if (files.markerImage) data.append("markerImage", files.markerImage);

    Object.entries(featureIconFiles).forEach(([index, file]) => {
      if (file) data.append(`featureIcon${index}`, file);
    });

    try {
      await api.put("/download-section", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="download-editor-loading">Loading...</p>;

  return (
    <div className="download-editor">
      <h1 className="download-editor-title">Download App Section</h1>
      <p className="download-editor-sub">This content appears on the homepage app-download block</p>

      <form className="download-editor-form" onSubmit={handleSubmit}>
        <label>Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />

        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Get the Bhrosa Cab Driver App Now"
        />

        <label>Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Download Button Link</label>
        <input
          value={form.downloadLink}
          onChange={(e) => setForm({ ...form, downloadLink: e.target.value })}
          placeholder="https://play.google.com/store/apps/details?id=..."
        />

        <label>Mobile Screenshot Image</label>
        {currentImages.mobileImage && !files.mobileImage && (
          <img
            src={`${SERVER_URL}${currentImages.mobileImage}`}
            alt=""
            className="download-editor-preview"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFiles({ ...files, mobileImage: e.target.files[0] })}
        />

        <label>Location Marker Image</label>
        {currentImages.markerImage && !files.markerImage && (
          <img
            src={`${SERVER_URL}${currentImages.markerImage}`}
            alt=""
            className="download-editor-preview"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFiles({ ...files, markerImage: e.target.files[0] })}
        />

        <div className="download-features-header">
          <label>Feature List (max 3)</label>
          {features.length < 3 && (
            <button type="button" className="download-add-feature-btn" onClick={addFeature}>
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        {features.map((feature, index) => (
          <div key={index} className="download-feature-card">
            <div className="download-feature-icon-row">
              {feature.icon && !featureIconFiles[index] && (
                <img
                  src={`${SERVER_URL}${feature.icon}`}
                  alt=""
                  className="download-feature-icon-preview"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => updateFeatureIcon(index, e.target.files[0])}
              />
              <button type="button" onClick={() => removeFeature(index)}>
                <Trash2 size={14} />
              </button>
            </div>
            <input
              value={feature.title}
              onChange={(e) => updateFeature(index, "title", e.target.value)}
              placeholder="Easy to Search"
            />
            <input
              value={feature.subtitle}
              onChange={(e) => updateFeature(index, "subtitle", e.target.value)}
              placeholder="Bhrosa Cab Taxi!"
            />
          </div>
        ))}

        <button type="submit" className="download-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}