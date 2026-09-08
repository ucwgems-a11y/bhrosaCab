import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../../../api/axios";
import "./FooterTopEditor.css";

const emptyForm = { description: "" };

export default function FooterTopEditor() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/footer-top").then((res) => {
      if (res.data) {
        setForm({
          description: res.data.description || "",
        });
        setCurrentLogo(res.data.logo || "");
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
    if (file) data.append("logo", file);

    try {
      await api.put("/footer-top", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="footer-top-editor-loading">Loading...</p>;

  return (
    <div className="footer-top-editor">
      <button
        className="footer-top-back-btn"
        onClick={() => navigate("/admin/settings/website/footer")}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="footer-top-editor-title">Footer — Top Section</h1>
      <p className="footer-top-editor-sub">
        Logo and description shown in the footer top. Phone number is managed from Company Info
        (Settings → Bhrosa Cab Website → Company Info).
      </p>

      <form className="footer-top-editor-form" onSubmit={handleSubmit}>
        <label>Logo</label>
        {currentLogo && !file && (
          <img
            src={`${SERVER_URL}${currentLogo}`}
            alt=""
            className="footer-top-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {currentLogo && !file && (
          <p className="footer-top-field-hint">Existing logo will be kept if you don't choose a new one</p>
        )}

        <label>Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <button type="submit" className="footer-top-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}