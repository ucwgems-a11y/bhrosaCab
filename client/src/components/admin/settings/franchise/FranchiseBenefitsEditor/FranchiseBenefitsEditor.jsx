import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../../../../api/axios";
import "./FranchiseBenefitsEditor.css";

const emptyForm = { heading: "", subheading: "" };

export default function FranchiseBenefitsEditor() {
  const [form, setForm] = useState(emptyForm);
  const [benefits, setBenefits] = useState([]);
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/franchise-benefits").then((res) => {
      if (res.data) {
        setForm({
          heading: res.data.heading || "",
          subheading: res.data.subheading || "",
        });
        setBenefits(res.data.benefits || []);
        setCurrentImage(res.data.image || "");
      }
      setLoading(false);
    });
  }, []);

  function addBenefit() {
    setBenefits([...benefits, { text: "" }]);
  }

  function updateBenefit(index, value) {
    const updated = [...benefits];
    updated[index].text = value;
    setBenefits(updated);
  }

  function removeBenefit(index) {
    setBenefits(benefits.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("benefits", JSON.stringify(benefits.filter((b) => b.text.trim() !== "")));
    if (file) data.append("image", file);

    try {
      await api.put("/franchise-benefits", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="franchise-benefits-editor-loading">Loading...</p>;

  return (
    <div className="franchise-benefits-editor">
      <h1 className="franchise-benefits-editor-title">Franchise Page — Benefits Section</h1>
      <p className="franchise-benefits-editor-sub">This content appears in the Franchise Benefits block</p>

      <form className="franchise-benefits-editor-form" onSubmit={handleSubmit}>
        <label>Heading</label>
        <textarea
          rows={3}
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          placeholder="Unlocking Opportunities for Growth and Community Impact"
        />

        <label>Subheading</label>
        <input
          value={form.subheading}
          onChange={(e) => setForm({ ...form, subheading: e.target.value })}
          placeholder="Franchisees Enjoy Numerous Benefits When Joining Bhrosa Cab:"
        />

        <label>Image</label>
        {currentImage && !file && (
          <img
            src={`${SERVER_URL}${currentImage}`}
            alt=""
            className="franchise-benefits-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {currentImage && !file && (
          <p className="franchise-benefits-field-hint">Existing image will be kept if you don't choose a new one</p>
        )}

        <div className="franchise-benefits-items-header">
          <label>Benefits List</label>
          <button type="button" className="franchise-benefits-add-item-btn" onClick={addBenefit}>
            <Plus size={14} /> Add
          </button>
        </div>
        <p className="franchise-benefits-field-hint">Numbering (1, 2, 3...) is added automatically — no need to type it yourself</p>

        {benefits.map((benefit, index) => (
          <div key={index} className="franchise-benefits-item-row">
            <span className="franchise-benefits-item-number">{index + 1}.</span>
            <textarea
              rows={2}
              value={benefit.text}
              onChange={(e) => updateBenefit(index, e.target.value)}
              placeholder="Established Brand Recognition: Leverage the Bhrosa name for immediate credibility."
            />
            <button type="button" onClick={() => removeBenefit(index)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button type="submit" className="franchise-benefits-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}