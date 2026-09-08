import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import api from "../../../../../api/axios";
import "./FooterMiddleEditor.css";

export default function FooterMiddleEditor() {
  const navigate = useNavigate();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/footer-middle").then((res) => {
      if (res.data) {
        setLinks(res.data.links || []);
      }
      setLoading(false);
    });
  }, []);

  function addLink() {
    setLinks([...links, { label: "", url: "" }]);
  }

  function updateLink(index, key, value) {
    const updated = [...links];
    updated[index][key] = value;
    setLinks(updated);
  }

  function removeLink(index) {
    setLinks(links.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/footer-middle", { links });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="footer-middle-editor-loading">Loading...</p>;

  return (
    <div className="footer-middle-editor">
      <button
        className="footer-middle-back-btn"
        onClick={() => navigate("/admin/settings/website/footer")}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="footer-middle-editor-title">Footer — Middle Section</h1>
      <p className="footer-middle-editor-sub">
        Useful links shown in the footer middle. Address and email are managed from Company Info
        (Settings → Bhrosa Cab Website → Company Info).
      </p>

      <form className="footer-middle-editor-form" onSubmit={handleSubmit}>
        <div className="footer-middle-links-header">
          <label>Useful Links</label>
          <button type="button" className="footer-middle-add-link-btn" onClick={addLink}>
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="footer-middle-field-hint">
          Point each link to a real page path, e.g. /about or /contact
        </p>

        {links.map((link, index) => (
          <div key={index} className="footer-middle-link-row">
            <input
              value={link.label}
              onChange={(e) => updateLink(index, "label", e.target.value)}
              placeholder="About Us"
            />
            <input
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
              placeholder="/about"
            />
            <button type="button" onClick={() => removeLink(index)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button type="submit" className="footer-middle-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}