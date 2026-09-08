import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete } from "../../../../utils/sweetAlert";
import countries from "../countries";
import "./ManagePricePage.css";

// TODO: replace with GET /api/km-price
const initialPrices = [
  { id: 1, country: "India", startKm: "0.00", endKm: "2.00", startTime: "08:01", endTime: "16:00", price: 45, weather: "clear" },
  { id: 2, country: "India", startKm: "0.00", endKm: "2.00", startTime: "08:01", endTime: "16:00", price: 50, weather: "rain" },
  { id: 3, country: "India", startKm: "0.00", endKm: "2.00", startTime: "12:01", endTime: "14:00", price: 55, weather: "clear" },
  { id: 4, country: "India", startKm: "0.00", endKm: "2.00", startTime: "14:01", endTime: "16:00", price: 52, weather: "clear" },
  { id: 5, country: "India", startKm: "0.00", endKm: "2.00", startTime: "16:01", endTime: "18:00", price: 53, weather: "clear" },
  { id: 6, country: "India", startKm: "2.01", endKm: "3.50", startTime: "00:01", endTime: "02:00", price: 70, weather: "clear" },
  { id: 7, country: "Germany", startKm: "1", endKm: "3", startTime: "10:39", endTime: "12:38", price: 5, weather: "clear" },
];

export default function ManagePricePage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState(initialPrices);
  const [form, setForm] = useState({
    startKm: "",
    endKm: "",
    startTime: "",
    endTime: "",
    country: "",
    weather: "",
    price: "",
  });
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.startKm || !form.endKm || !form.price) return;
    setSubmitting(true);
    setTimeout(() => {
      const newPrice = {
        id: Date.now(),
        country: form.country || "India",
        startKm: Number(form.startKm).toFixed(2),
        endKm: Number(form.endKm).toFixed(2),
        startTime: form.startTime || "00:00",
        endTime: form.endTime || "23:59",
        price: Number(form.price),
        weather: form.weather || "clear",
      };
      setPrices((prev) => [newPrice, ...prev]);
      setForm({
        startKm: "",
        endKm: "",
        startTime: "",
        endTime: "",
        country: "",
        weather: "",
        price: "",
      });
      setSubmitting(false);
    }, 200);
  }

  function handleEdit(id) {
    navigate(`/admin/price/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this distance pricing rule!",
      deletedText: "Price rule has been deleted.",
      onConfirm: () => {
        setPrices((prev) => prev.filter((p) => p.id !== id));
      },
    });
  }

  const filteredPrices = prices.filter((row) => {
    const haystack = `${row.country} ${row.startKm} ${row.endKm} ${row.startTime} ${row.endTime} ${row.price} ${row.weather}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div>
      {/* ============ Add Distance Price form ============ */}
      <div className="price-form-card">
        <h2 className="price-form-heading">Add Distance Price</h2>

        <form onSubmit={handleSubmit}>
          <label>Distance</label>
          <div className="price-form-row">
            <div className="price-form-col">
              <label className="price-form-sublabel">Start (KM)</label>
              <input
                type="number"
                name="startKm"
                min="0"
                step="0.01"
                value={form.startKm}
                onChange={handleChange}
                placeholder="0"
              />
            </div>
            <div className="price-form-col">
              <label className="price-form-sublabel">End (KM)</label>
              <input
                type="number"
                name="endKm"
                min="0"
                step="0.01"
                value={form.endKm}
                onChange={handleChange}
                placeholder="2"
              />
            </div>
          </div>

          <label>Slot Time</label>
          <div className="price-form-row">
            <div className="price-form-col">
              <label className="price-form-sublabel">Start</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
              />
            </div>
            <div className="price-form-col">
              <label className="price-form-sublabel">End</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="price-form-grid">
            <div className="price-form-group">
              <label>Country Name</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
              >
                <option value="">Select country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="price-form-group">
              <label>Weather condition</label>
              <select
                name="weather"
                value={form.weather}
                onChange={handleChange}
              >
                <option value="">Select Weather</option>
                <option value="clear">clear</option>
                <option value="rain">rain</option>
                <option value="fog">fog</option>
                <option value="snow">snow</option>
              </select>
            </div>
          </div>

          <label>Price</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="0"
          />

          <button
            type="submit"
            className="price-submit-btn"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>

      {/* ============ Distance Price List table ============ */}
      <h1 className="price-page-title">Added Distance Price</h1>

      <div className="price-search-row">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="price-table-wrap">
        <table className="price-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Country Name</th>
              <th>Start KM</th>
              <th>End KM</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Price</th>
              <th>Weather condition</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrices.map((row, i) => (
              <tr key={row.id}>
                <td>{i + 1}</td>
                <td>{row.country}</td>
                <td>{row.startKm}</td>
                <td>{row.endKm}</td>
                <td>{row.startTime}</td>
                <td>{row.endTime}</td>
                <td>₹ {row.price}</td>
                <td>{row.weather}</td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="price-icon-btn edit"
                      title="Edit"
                      onClick={() => handleEdit(row.id)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="price-icon-btn delete"
                      title="Delete"
                      onClick={() => handleDelete(row.id)}
                      style={{
                        background: "#e5484d",
                        border: "none",
                        color: "#fff",
                        width: "30px",
                        height: "30px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}