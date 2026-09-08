import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import api from "../../../../../api/axios";
import "./FooterVehiclesEditor.css";

const emptyForm = { direction: "rightToLeft", speed: 15, width: 120, order: 0 };

export default function FooterVehiclesEditor() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function loadVehicles() {
    setLoading(true);
    api
      .get("/footer-vehicles")
      .then((res) => setVehicles(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  function openAddForm() {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(vehicle) {
    setForm({
      direction: vehicle.direction,
      speed: vehicle.speed,
      width: vehicle.width,
      order: vehicle.order || 0,
    });
    setFile(null);
    setEditingId(vehicle._id);
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
        await api.put(`/footer-vehicles/${editingId}`, data);
      } else {
        await api.post("/footer-vehicles", data);
      }
      setShowForm(false);
      loadVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Remove this vehicle?")) return;
    await api.delete(`/footer-vehicles/${id}`);
    loadVehicles();
  }

  return (
    <div className="footer-vehicles-editor">
      <div className="footer-vehicles-header">
        <div>
          <h1 className="footer-vehicles-title">Running Vehicles</h1>
          <p className="footer-vehicles-sub">
            Manage the moving vehicle graphics at the bottom of the footer
          </p>
        </div>
        <button className="footer-vehicles-add-btn" onClick={openAddForm}>
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <p className="footer-vehicles-loading">Loading...</p>
      ) : (
        <div className="footer-vehicles-list">
          {vehicles.length === 0 && <p className="footer-vehicles-loading">No vehicles added yet.</p>}
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="footer-vehicle-row">
              <img
                src={`${SERVER_URL}${vehicle.image}`}
                alt=""
                className="footer-vehicle-thumb"
              />
              <div className="footer-vehicle-info">
                <div className="footer-vehicle-name">
                  {vehicle.direction === "rightToLeft" ? "Right → Left" : "Left → Right"}
                </div>
                <div className="footer-vehicle-meta">Speed: {vehicle.speed}s · Width: {vehicle.width}px</div>
              </div>
              <div className="footer-vehicle-actions">
                <button onClick={() => openEditForm(vehicle)}><Pencil size={16} /></button>
                <button onClick={() => handleDelete(vehicle._id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="footer-vehicles-modal-overlay">
          <form className="footer-vehicles-modal" onSubmit={handleSubmit}>
            <div className="footer-vehicles-modal-header">
              <h2>{editingId ? "Edit Vehicle" : "Add New Vehicle"}</h2>
              <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <label>
              Vehicle Image <span className="footer-vehicles-required-tag">Required</span>
            </label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
            {editingId && !file && (
              <p className="footer-vehicles-field-hint">Existing image will be kept if you don't choose a new one</p>
            )}

            <label>Direction</label>
            <select
              value={form.direction}
              onChange={(e) => setForm({ ...form, direction: e.target.value })}
            >
              <option value="rightToLeft">Right → Left</option>
              <option value="leftToRight">Left → Right</option>
            </select>

            <label>Speed (seconds — lower is faster)</label>
            <input
              type="number"
              min="3"
              max="60"
              value={form.speed}
              onChange={(e) => setForm({ ...form, speed: e.target.value })}
            />

            <label>Width (px)</label>
            <input
              type="number"
              value={form.width}
              onChange={(e) => setForm({ ...form, width: e.target.value })}
            />

            <label>Display Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />

            <button type="submit" className="footer-vehicles-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}