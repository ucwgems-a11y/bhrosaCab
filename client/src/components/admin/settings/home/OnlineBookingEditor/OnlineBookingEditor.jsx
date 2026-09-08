import { SERVER_URL } from "../../../../../config";
import { useEffect, useState } from "react";
import api from "../../../../../api/axios";
import "./OnlineBookingEditor.css";

export default function OnlineBookingEditor() {
  const [form, setForm] = useState({ label: "ONLINE BOOKING", title: "" });
  const [file, setFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/online-booking").then((res) => {
      if (res.data) {
        setForm({
          label: res.data.label || "ONLINE BOOKING",
          title: res.data.title || "",
        });
        setCurrentImage(res.data.carImage || "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const data = new FormData();
    data.append("label", form.label);
    data.append("title", form.title);
    if (file) data.append("carImage", file);

    try {
      await api.put("/online-booking", data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="booking-editor-loading">Loading...</p>;

  return (
    <div className="booking-editor">
      <h1 className="booking-editor-title">Online Booking Section</h1>
      <p className="booking-editor-sub">This content appears on the homepage Online Booking block</p>

      <form className="booking-editor-form" onSubmit={handleSubmit}>
        <label>Label</label>
        <input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />

        <label>Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ride Start Soon!"
        />

        <label>Car Image</label>
        {currentImage && !file && (
          <img
            src={`${SERVER_URL}${currentImage}`}
            alt=""
            className="booking-editor-preview"
          />
        )}
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {currentImage && !file && (
          <p className="booking-field-hint">Existing image will be kept if you don't choose a new one</p>
        )}

        <button type="submit" className="booking-save-btn" disabled={saving}>
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}