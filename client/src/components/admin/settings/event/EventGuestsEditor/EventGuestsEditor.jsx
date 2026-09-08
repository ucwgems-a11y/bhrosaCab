import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import api from "../../../../../api/axios";
import "./EventGuestsEditor.css";

const emptyForm = { name: "", role: "", order: 0 };

export default function EventGuestsEditor() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function loadGuests() {
    setLoading(true);
    api
      .get("/event-guests")
      .then((res) => setGuests(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadGuests();
  }, []);

  function openAddForm() {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(guest) {
    setForm({
      name: guest.name || "",
      role: guest.role || "",
      order: guest.order || 0,
    });
    setFile(null);
    setEditingId(guest._id);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    if (file) data.append("image", file);

    try {
      if (editingId) {
        await api.put(`/event-guests/${editingId}`, data);
      } else {
        await api.post("/event-guests", data);
      }
      setShowForm(false);
      loadGuests();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save guest");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this guest?")) return;
    await api.delete(`/event-guests/${id}`);
    loadGuests();
  }

  return (
    <div className="event-guests-editor">
      <div className="event-guests-header">
        <div>
          <h1 className="event-guests-title">Event Guests</h1>
          <p className="event-guests-sub">Manage the guest cards shown on the Event page</p>
        </div>
        <button className="event-guests-add-btn" onClick={openAddForm}>
          <Plus size={16} /> Add Guest
        </button>
      </div>

      {loading ? (
        <p className="event-guests-loading">Loading...</p>
      ) : (
        <div className="event-guests-list">
          {guests.length === 0 && <p className="event-guests-loading">No guests added yet.</p>}
          {guests.map((guest) => (
            <div key={guest._id} className="event-guest-row">
              {guest.image && (
                <img
                  src={`${SERVER_URL}${guest.image}`}
                  alt=""
                  className="event-guest-thumb"
                />
              )}
              <div className="event-guest-info">
                <div className="event-guest-name">{guest.name}</div>
                <div className="event-guest-role">{guest.role}</div>
              </div>
              <div className="event-guest-actions">
                <button onClick={() => openEditForm(guest)}><Pencil size={16} /></button>
                <button onClick={() => handleDelete(guest._id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="event-guests-modal-overlay">
          <form className="event-guests-modal" onSubmit={handleSubmit}>
            <div className="event-guests-modal-header">
              <h2>{editingId ? "Edit Guest" : "Add New Guest"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Sumbul Touqeer"
              required
            />

            <label>Role</label>
            <input
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Actress"
            />

            <label>
              Photo <span className="event-guests-required-tag">Required</span>
            </label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            {editingId && !file && (
              <p className="event-guests-field-hint">Existing image will be kept if you don't choose a new one</p>
            )}

            <label>Display Order (0 shows first)</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />

            <button type="submit" className="event-guests-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}