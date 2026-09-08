import { SERVER_URL } from "../../../../config";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../../../../api/axios";
import "./SiteHeaderEditor.css";

export default function SiteHeaderEditor() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [currentLogo, setCurrentLogo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/site-header").then((res) => {
      if (res.data) {
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
    if (file) data.append("logo", file);

    try {
      await api.put("/site-header", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="site-header-editor-loading">Loading...</p>;

  return (
    <div className="site-header-editor">
      <button
        className="site-header-back-btn"
        onClick={() => navigate("/admin/settings/website")}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="site-header-editor-title">Site Header</h1>
      <p className="site-header-editor-sub">
        This logo appears in the top header on every page of the website. Phone, email, and address
        are managed from Company Info (Settings → Bhrosa Cab Website → Company Info).
      </p>

      <form className="site-header-editor-form" onSubmit={handleSubmit}>
        <label>Logo</label>
        {currentLogo && !file && (
          <img
            src={`${SERVER_URL}${currentLogo}`}
            alt=""
            className="site-header-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {currentLogo && !file && (
          <p className="site-header-field-hint">Existing logo will be kept if you don't choose a new one</p>
        )}

        <button type="submit" className="site-header-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}