import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import api from "../../../../../api/axios";
import "./CabOfferEditor.css";

const emptyCardForm = { title: "", description: "", order: 0 };

export default function CabOfferEditor() {
  // Heading state
  const [heading, setHeading] = useState({ label: "WHAT WE OFFER", title: "", description: "" });
  const [headingSaving, setHeadingSaving] = useState(false);
  const [headingSaved, setHeadingSaved] = useState(false);

  // Cards state
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cardForm, setCardForm] = useState(emptyCardForm);
  const [files, setFiles] = useState({ bg: null, vehicle: null });
  const [saving, setSaving] = useState(false);

  function loadAll() {
    setLoading(true);
    Promise.all([api.get("/offer-heading"), api.get("/offer-cards")]).then(
      ([headingRes, cardsRes]) => {
        if (headingRes.data) {
          setHeading({
            label: headingRes.data.label || "WHAT WE OFFER",
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
      await api.put("/offer-heading", heading);
      setHeadingSaved(true);
      setTimeout(() => setHeadingSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save heading");
    } finally {
      setHeadingSaving(false);
    }
  }

  function openAddCard() {
    setCardForm(emptyCardForm);
    setFiles({ bg: null, vehicle: null });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditCard(card) {
    setCardForm({
      title: card.title || "",
      description: card.description || "",
      order: card.order || 0,
    });
    setFiles({ bg: null, vehicle: null });
    setEditingId(card._id);
    setShowForm(true);
  }

  async function handleCardSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(cardForm).forEach(([key, value]) => data.append(key, value));
    if (files.bg) data.append("bg", files.bg);
    if (files.vehicle) data.append("vehicle", files.vehicle);

    try {
      if (editingId) {
        await api.put(`/offer-cards/${editingId}`, data);
      } else {
        await api.post("/offer-cards", data);
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
    if (!confirm("Delete this offer card?")) return;
    await api.delete(`/offer-cards/${id}`);
    loadAll();
  }

  if (loading) return <p className="offer-editor-loading">Loading...</p>;

  return (
    <div className="offer-editor">
      <h1 className="offer-editor-title">Cab Offer Section</h1>
      <p className="offer-editor-sub">Manage the section heading and offer cards</p>

      {/* Heading form */}
      <form className="offer-heading-form" onSubmit={handleHeadingSave}>
        <h2 className="offer-editor-subtitle">Section Heading</h2>

        <label>Label</label>
        <input
          value={heading.label}
          onChange={(e) => setHeading({ ...heading, label: e.target.value })}
        />

        <label>Title</label>
        <textarea
          rows={2}
          value={heading.title}
          onChange={(e) => setHeading({ ...heading, title: e.target.value })}
          placeholder="Start your journey with Bhrosa Cab."
        />

        <label>Description</label>
        <textarea
          rows={2}
          value={heading.description}
          onChange={(e) => setHeading({ ...heading, description: e.target.value })}
        />

        <button type="submit" className="offer-save-btn" disabled={headingSaving}>
          {headingSaving ? "Saving..." : headingSaved ? "Saved ✓" : "Save Heading"}
        </button>
      </form>

      {/* Cards list */}
      <div className="offer-cards-header">
        <h2 className="offer-editor-subtitle">Offer Cards</h2>
        <button className="offer-add-btn" onClick={openAddCard}>
          <Plus size={16} /> Add Card
        </button>
      </div>

      <div className="offer-card-list">
        {cards.length === 0 && <p className="offer-editor-loading">No cards added yet.</p>}
        {cards.map((card) => (
          <div key={card._id} className="offer-card-row">
            {card.bg && (
              <img src={`${SERVER_URL}${card.bg}`} alt="" className="offer-card-thumb" />
            )}
            <div className="offer-card-info">
              <div className="offer-card-name">{card.title}</div>
              <div className="offer-card-desc">{card.description}</div>
            </div>
            <div className="offer-card-actions">
              <button onClick={() => openEditCard(card)}><Pencil size={16} /></button>
              <button onClick={() => handleDeleteCard(card._id)}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="offer-modal-overlay">
          <form className="offer-modal" onSubmit={handleCardSubmit}>
            <div className="offer-modal-header">
              <h2>{editingId ? "Edit Card" : "Add New Card"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <label>Title</label>
            <input
              value={cardForm.title}
              onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
              placeholder="24/7 Availability"
              required
            />

            <label>Description</label>
            <textarea
              rows={3}
              value={cardForm.description}
              onChange={(e) => setCardForm({ ...cardForm, description: e.target.value })}
            />

            <label>
              Background Shape Image <span className="offer-required-tag">Required</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFiles({ ...files, bg: e.target.files[0] })}
            />
            {editingId && !files.bg && (
              <p className="offer-field-hint">Existing image will be kept if you don't choose a new one</p>
            )}

            <label>
              Vehicle Image <span className="offer-required-tag">Required</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFiles({ ...files, vehicle: e.target.files[0] })}
            />
            {editingId && !files.vehicle && (
              <p className="offer-field-hint">Existing image will be kept if you don't choose a new one</p>
            )}

            <label>Display Order (0 shows first)</label>
            <input
              type="number"
              value={cardForm.order}
              onChange={(e) => setCardForm({ ...cardForm, order: e.target.value })}
            />

            <button type="submit" className="offer-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}