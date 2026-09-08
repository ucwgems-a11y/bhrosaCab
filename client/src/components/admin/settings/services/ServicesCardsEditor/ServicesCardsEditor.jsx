import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import api from "../../../../../api/axios";
import "./ServicesCardsEditor.css";

const emptyCardForm = { title: "", description: "", order: 0 };

export default function ServicesCardsEditor() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyCardForm);
  const [files, setFiles] = useState({ bg: null, icon: null });
  const [saving, setSaving] = useState(false);

  function loadCards() {
    setLoading(true);
    api
      .get("/service-cards")
      .then((res) => setCards(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCards();
  }, []);

  function openAddForm() {
    setForm(emptyCardForm);
    setFiles({ bg: null, icon: null });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(card) {
    setForm({
      title: card.title || "",
      description: card.description || "",
      order: card.order || 0,
    });
    setFiles({ bg: null, icon: null });
    setEditingId(card._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (files.bg) data.append("bg", files.bg);
    if (files.icon) data.append("icon", files.icon);

    try {
      if (editingId) {
        await api.put(`/service-cards/${editingId}`, data);
      } else {
        await api.post("/service-cards", data);
      }
      setShowForm(false);
      loadCards();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save card");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this service card?")) return;
    await api.delete(`/service-cards/${id}`);
    loadCards();
  }

  return (
    <div className="services-cards-editor">
      <div className="services-cards-editor-header">
        <div>
          <h1 className="services-cards-editor-title">Services Cards</h1>
          <p className="services-cards-editor-sub">Manage the service cards shown on the Services page</p>
        </div>
        <button className="services-cards-add-btn" onClick={openAddForm}>
          <Plus size={16} /> Add Card
        </button>
      </div>

      {loading ? (
        <p className="services-cards-editor-loading">Loading...</p>
      ) : (
        <div className="services-cards-list">
          {cards.length === 0 && <p className="services-cards-editor-loading">No cards added yet.</p>}
          {cards.map((card) => (
            <div key={card._id} className="services-card-row">
              {card.bg && (
                <img
                  src={`${SERVER_URL}${card.bg}`}
                  alt=""
                  className="services-card-thumb"
                />
              )}
              <div className="services-card-info">
                <div className="services-card-name">{card.title}</div>
                <div className="services-card-desc">{card.description}</div>
              </div>
              <div className="services-card-actions">
                <button onClick={() => openEditForm(card)}><Pencil size={16} /></button>
                <button onClick={() => handleDelete(card._id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="services-cards-modal-overlay">
          <form className="services-cards-modal" onSubmit={handleSubmit}>
            <div className="services-cards-modal-header">
              <h2>{editingId ? "Edit Card" : "Add New Card"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <label>Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="🚖 24/7 Availability"
              required
            />

            <label>Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <label>
              Background Shape Image <span className="services-cards-required-tag">Required</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFiles({ ...files, bg: e.target.files[0] })}
            />
            {editingId && !files.bg && (
              <p className="services-cards-field-hint">Existing image will be kept if you don't choose a new one</p>
            )}

            <label>
              Icon / Vehicle Image <span className="services-cards-required-tag">Required</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFiles({ ...files, icon: e.target.files[0] })}
            />
            {editingId && !files.icon && (
              <p className="services-cards-field-hint">Existing image will be kept if you don't choose a new one</p>
            )}

            <label>Display Order (0 shows first)</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />

            <button type="submit" className="services-cards-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}