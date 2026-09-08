import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import api from "../../../../../api/axios";
import "./HeroEditor.css";

const emptyForm = {
  type: "content",
  subtitle: "",
  title: "",
  highlight: "",
  description: "",
  button: "Book Now",
  order: 0,
};

export default function HeroEditor() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState({ image: null, bg: null, car: null });
  const [saving, setSaving] = useState(false);

  function loadSlides() {
    setLoading(true);
    api
      .get("/hero-slides")
      .then((res) => setSlides(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSlides();
  }, []);

  function openAddForm() {
    setForm(emptyForm);
    setFiles({ image: null, bg: null, car: null });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(slide) {
    setForm({
      type: slide.type,
      subtitle: slide.subtitle || "",
      title: slide.title || "",
      highlight: slide.highlight || "",
      description: slide.description || "",
      button: slide.button || "",
      order: slide.order || 0,
    });
    setFiles({ image: null, bg: null, car: null });
    setEditingId(slide._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (files.image) data.append("image", files.image);
    if (files.bg) data.append("bg", files.bg);
    if (files.car) data.append("car", files.car);

    try {
      if (editingId) {
        await api.put(`/hero-slides/${editingId}`, data);
      } else {
        await api.post("/hero-slides", data);
      }
      setShowForm(false);
      loadSlides();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save slide");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this slide? This cannot be undone.")) return;
    await api.delete(`/hero-slides/${id}`);
    loadSlides();
  }

  return (
    <div className="hero-editor">
      <div className="hero-editor-header">
        <div>
          <h1 className="hero-editor-title">Hero Section</h1>
          <p className="hero-editor-sub">Manage the slides shown in the homepage top slider</p>
        </div>
        <button className="hero-add-btn" onClick={openAddForm}>
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {loading ? (
        <p className="hero-editor-loading">Loading...</p>
      ) : (
        <div className="hero-slide-list">
          {slides.length === 0 && <p className="hero-editor-loading">No slides added yet.</p>}
          {slides.map((slide) => (
            <div key={slide._id} className="hero-slide-row">
              <img
                src={
                  slide.type === "banner"
                    ? `${SERVER_URL}${slide.image}`
                    : `${SERVER_URL}${slide.bg}`
                }
                alt=""
                className="hero-slide-thumb"
              />
              <div className="hero-slide-info">
                <div className="hero-slide-type">{slide.type}</div>
                <div className="hero-slide-name">{slide.title || slide.subtitle || "Banner slide"}</div>
              </div>
              <div className="hero-slide-actions">
                <button onClick={() => openEditForm(slide)}><Pencil size={16} /></button>
                <button onClick={() => handleDelete(slide._id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="hero-modal-overlay">
          <form className="hero-modal" onSubmit={handleSubmit}>
            <div className="hero-modal-header">
              <h2>{editingId ? "Edit Slide" : "Add New Slide"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <label>Slide Type</label>
            <div className="hero-type-tabs">
              <button
                type="button"
                className={`hero-type-tab ${form.type === "banner" ? "active" : ""}`}
                onClick={() => setForm({ ...form, type: "banner" })}
              >
                🖼️ Banner Slide
                <span>Single full-width image</span>
              </button>
              <button
                type="button"
                className={`hero-type-tab ${form.type === "content" ? "active" : ""}`}
                onClick={() => setForm({ ...form, type: "content" })}
              >
                📝 Content Slide
                <span>Text + background + car image</span>
              </button>
            </div>

            {form.type === "banner" ? (
              <>
                <label>
                  Banner Image <span className="hero-required-tag">Required</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, image: e.target.files[0] })}
                />
                {editingId && !files.image && (
                  <p className="hero-field-hint">Existing image will be kept if you don't choose a new one</p>
                )}
              </>
            ) : (
              <>
                <label>Subtitle</label>
                <input
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Get the Bhrosa Cab Mobile App..."
                />

                <label>Title</label>
                <textarea
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ride Anywhere, Anytime..."
                  rows={5}
                />
                <p className="hero-field-hint">
                  Press Enter to start a new line (up to 3 lines looks best)
                </p>

                <label>Highlight Line (optional)</label>
                <input
                  value={form.highlight}
                  onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                  placeholder="RIDE START"
                />
                <p className="hero-field-hint">
                  Enter the exact line from the title above that should be highlighted in a different color
                </p>

                <label>Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Safe, reliable, and comfortable rides..."
                />

                <label>Button Text</label>
                <input
                  value={form.button}
                  onChange={(e) => setForm({ ...form, button: e.target.value })}
                />

                <label>
                  Background Image <span className="hero-required-tag">Required</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, bg: e.target.files[0] })}
                />
                {editingId && !files.bg && (
                  <p className="hero-field-hint">Existing image will be kept if you don't choose a new one</p>
                )}

                <label>
                  Car Image <span className="hero-required-tag">Required</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, car: e.target.files[0] })}
                />
                {editingId && !files.car && (
                  <p className="hero-field-hint">Existing image will be kept if you don't choose a new one</p>
                )}
              </>
            )}

            <label>Display Order (0 shows first)</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />

            <button type="submit" className="hero-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}