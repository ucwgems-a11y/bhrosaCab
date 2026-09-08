import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../../../../api/axios";
import "./CtaSectionEditor.css";

const emptyForm = {
  label: "Bhrosa Cab Services!",
  heading: "",
  buttonText: "Book a Cab",
  buttonLink: "",
};

export default function CtaSectionEditor() {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/cta-section").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "Bhrosa Cab Services!",
          heading: res.data.heading || "",
          buttonText: res.data.buttonText || "Book a Cab",
          buttonLink: res.data.buttonLink || "",
        });
        setItems(res.data.items || []);
        setCurrentImage(res.data.image || "");
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

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("items", JSON.stringify(items));
    if (file) data.append("image", file);

    try {
      await api.put("/cta-section", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="cta-editor-loading">Loading...</p>;

  return (
    <div className="cta-editor">
      <h1 className="cta-editor-title">About Page — CTA Section</h1>
      <p className="cta-editor-sub">This content appears in the call-to-action block on the About page</p>

      <form className="cta-editor-form" onSubmit={handleSubmit}>
        <label>Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />

        <label>Heading</label>
        <input
          value={form.heading}
          onChange={(e) => setForm({ ...form, heading: e.target.value })}
          placeholder="Feel your journey with Bhrosa Cab!"
        />

        <label>Button Text</label>
        <input
          value={form.buttonText}
          onChange={(e) => setForm({ ...form, buttonText: e.target.value })}
        />

        <label>Button Link</label>
        <input
          value={form.buttonLink}
          onChange={(e) => setForm({ ...form, buttonLink: e.target.value })}
          placeholder="/booking or https://..."
        />

        <label>Image</label>
        {currentImage && !file && (
          <img
            src={`${SERVER_URL}${currentImage}`}
            alt=""
            className="cta-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {currentImage && !file && (
          <p className="cta-field-hint">Existing image will be kept if you don't choose a new one</p>
        )}

        <div className="cta-items-header">
          <label>List Items</label>
          <button type="button" className="cta-add-item-btn" onClick={addItem}>
            <Plus size={14} /> Add
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="cta-item-row">
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

        <button type="submit" className="cta-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}