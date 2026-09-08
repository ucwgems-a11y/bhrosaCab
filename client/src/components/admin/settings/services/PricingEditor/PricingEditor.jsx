import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import api from "../../../../../api/axios";
import "./PricingEditor.css";

const emptyCardForm = { title: "", price: "", order: 0 };

export default function PricingEditor() {
  const [heading, setHeading] = useState({ label: "TRANSPARENT PRICING", title: "", description: "" });
  const [headingSaving, setHeadingSaving] = useState(false);
  const [headingSaved, setHeadingSaved] = useState(false);

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCardForm);
  const [features, setFeatures] = useState([]);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    Promise.all([api.get("/pricing-heading"), api.get("/pricing-cards")]).then(
      ([headingRes, cardsRes]) => {
        if (headingRes.data) {
          setHeading({
            label: headingRes.data.label || "TRANSPARENT PRICING",
            title: headingRes.data.title || "",
            description: headingRes.data.description || "",
          });
        }
        setCards(cardsRes.data);
        setLoading(false);
      }
    );
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleHeadingSave(e) {
    e.preventDefault();
    setHeadingSaving(true);
    setHeadingSaved(false);
    try {
      await api.put("/pricing-heading", heading);
      setHeadingSaved(true);
      setTimeout(() => setHeadingSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save heading");
    } finally {
      setHeadingSaving(false);
    }
  }

  function openAddCard() {
    setForm(emptyCardForm);
    setFeatures([]);
    setFile(null);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditCard(card) {
    setForm({ title: card.title || "", price: card.price || "", order: card.order || 0 });
    setFeatures(card.features || []);
    setFile(null);
    setEditingId(card._id);
    setShowForm(true);
  }

  function addFeature() {
    setFeatures([...features, ""]);
  }

  function updateFeature(index, value) {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  }

  function removeFeature(index) {
    setFeatures(features.filter((_, i) => i !== index));
  }

  async function handleCardSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("features", JSON.stringify(features.filter((f) => f.trim() !== "")));
    if (file) data.append("image", file);

    try {
      if (editingId) {
        await api.put(`/pricing-cards/${editingId}`, data);
      } else {
        await api.post("/pricing-cards", data);
      }
      setShowForm(false);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save card");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCard(id) {
    if (!confirm("Delete this pricing card?")) return;
    await api.delete(`/pricing-cards/${id}`);
    loadAll();
  }

  if (loading) return <p className="pricing-editor-loading">Loading...</p>;

  return (
    <div className="pricing-editor">
      <h1 className="pricing-editor-title">Pricing Section</h1>
      <p className="pricing-editor-sub">Manage the section heading and per-vehicle pricing cards</p>

      <form className="pricing-heading-form" onSubmit={handleHeadingSave}>
        <h2 className="pricing-editor-subtitle">Section Heading</h2>

        <label>Label</label>
        <input
          value={heading.label}
          onChange={(e) => setHeading({ ...heading, label: e.target.value })}
        />

        <label>Title</label>
        <input
          value={heading.title}
          onChange={(e) => setHeading({ ...heading, title: e.target.value })}
          placeholder="Our Per Kilometer Rates"
        />

        <label>Description</label>
        <input
          value={heading.description}
          onChange={(e) => setHeading({ ...heading, description: e.target.value })}
        />

        <button type="submit" className="pricing-save-btn" disabled={headingSaving}>
          {headingSaving ? "Saving..." : headingSaved ? "Saved ✓" : "Save Heading"}
        </button>
      </form>

      <div className="pricing-cards-header">
        <h2 className="pricing-editor-subtitle">Pricing Cards</h2>
        <button className="pricing-add-btn" onClick={openAddCard}>
          <Plus size={16} /> Add Card
        </button>
      </div>

      <div className="pricing-card-list">
        {cards.length === 0 && <p className="pricing-editor-loading">No cards added yet.</p>}
        {cards.map((card) => (
          <div key={card._id} className="pricing-card-row">
            {card.image && (
              <img
                src={`${SERVER_URL}${card.image}`}
                alt=""
                className="pricing-card-thumb"
              />
            )}
            <div className="pricing-card-info">
              <div className="pricing-card-name">{card.title} — {card.price}/km</div>
              <div className="pricing-card-features">{(card.features || []).join(" • ")}</div>
            </div>
            <div className="pricing-card-actions">
              <button onClick={() => openEditCard(card)}><Pencil size={16} /></button>
              <button onClick={() => handleDeleteCard(card._id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="pricing-modal-overlay">
          <form className="pricing-modal" onSubmit={handleCardSubmit}>
            <div className="pricing-modal-header">
              <h2>{editingId ? "Edit Pricing Card" : "Add New Pricing Card"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <label>Vehicle Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Sedan"
              required
            />

            <label>Price per km</label>
            <input
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="₹20 - ₹27"
              required
            />

            <label>
              Vehicle Image <span className="pricing-required-tag">Required</span>
            </label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            {editingId && !file && (
              <p className="pricing-field-hint">Existing image will be kept if you don't choose a new one</p>
            )}

            <div className="pricing-features-header">
              <label>Features</label>
              <button type="button" className="pricing-add-feature-btn" onClick={addFeature}>
                <Plus size={14} /> Add
              </button>
            </div>

            {features.map((feature, index) => (
              <div key={index} className="pricing-feature-row">
                <input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder="Spacious interior"
                />
                <button type="button" onClick={() => removeFeature(index)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <label>Display Order (0 shows first)</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />

            <button type="submit" className="pricing-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}