import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../../../../api/axios";
import "./TaxiCtaEditor.css";

const emptyForm = {
  label: "Bhrosa Cab Taxi Services!",
  heading: "",
  buttonText: "Book a Taxi",
  buttonLink: "",
};

export default function TaxiCtaEditor() {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/taxi-cta").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "Bhrosa Cab Taxi Services!",
          heading: res.data.heading || "",
          buttonText: res.data.buttonText || "Book a Taxi",
          buttonLink: res.data.buttonLink || "",
        });
        setItems(res.data.items || []);
      }
      setLoading(false);
    });
  }, []);

  function addItem() {
    setItems([...items, { text: "" }]);
  }

  function updateItem(index, value) {
    const updated = [...items];
    updated[index].text = value;
    setItems(updated);
  }

  function removeItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/taxi-cta", { ...form, items: JSON.stringify(items) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="taxi-cta-editor-loading">Loading...</p>;

  return (
    <div className="taxi-cta-editor">
      <h1 className="taxi-cta-editor-title">Services Page — Taxi CTA</h1>
      <p className="taxi-cta-editor-sub">This content appears in the bottom call-to-action block</p>

      <form className="taxi-cta-editor-form" onSubmit={handleSubmit}>
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
          placeholder={"Feel your journey with\nBhrosa Cab!"}
        />
        <p className="taxi-cta-field-hint">Press Enter for a line break</p>

        <label>Button Text</label>
        <input
          value={form.buttonText}
          onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
        />

        <label>Button Link</label>
        <input
          value={form.buttonLink}
          onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
          placeholder="/ or https://..."
        />

        <div className="taxi-cta-items-header">
          <label>List Items</label>
          <button type="button" className="taxi-cta-add-item-btn" onClick={addItem}>
            <Plus size={14} /> Add
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="taxi-cta-item-row">
            <input
              value={item.text}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Easy payment systems."
            />
            <button type="button" onClick={() => removeItem(index)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        <button type="submit" className="taxi-cta-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}