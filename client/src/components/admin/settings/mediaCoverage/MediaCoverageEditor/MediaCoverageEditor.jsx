import { useEffect, useState } from "react";
import { Trash2, Pencil, Plus, X, ExternalLink, Calendar, Newspaper, MapPin, UploadCloud } from "lucide-react";
import api from "../../../../../api/axios";
import { SERVER_URL } from "../../../../../config";
import {
  mediaArticles,
  formatDisplayDate,
  resolveMediaImage,
} from "../../../../bhrosawebsite/MediaCoverage/mediaArticlesData";
import "./MediaCoverageEditor.css";

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  displayDate: "",
  title: "",
  newspaper: "",
  city: "",
  description: "",
  link: "",
  linkText: "ई-पेपर / खबर पढ़ें",
  isActive: true,
};

export default function MediaCoverageEditor() {
  const [coverages, setCoverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  function loadCoverages() {
    setLoading(true);
    api
      .get("/media-coverages")
      .then((res) => {
        setCoverages(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to load media coverages:", err);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCoverages();
  }, []);

  function getImageUrl(item) {
    if (!item) return "";
    const rawImage = item.image || item.filename || "";
    if (!rawImage) return "";
    if (
      rawImage.startsWith("http://") ||
      rawImage.startsWith("https://") ||
      rawImage.startsWith("data:")
    ) {
      return rawImage;
    }
    if (rawImage.startsWith("/uploads/")) {
      return `${SERVER_URL}${rawImage}`;
    }
    return resolveMediaImage(rawImage);
  }

  function openAddForm() {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().split("T")[0],
    });
    setFile(null);
    setFilePreview("");
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(item) {
    let dStr = "";
    if (item.date) {
      try {
        dStr = new Date(item.date).toISOString().split("T")[0];
      } catch {
        dStr = String(item.date).split("T")[0];
      }
    }

    setForm({
      date: dStr || "",
      displayDate: item.displayDate || "",
      title: item.title || "",
      newspaper: item.newspaper || "",
      city: item.city || "",
      description: item.description || "",
      link: item.link || "",
      linkText: item.linkText || "ई-पेपर / खबर पढ़ें",
      isActive: item.isActive !== false,
    });
    setFile(null);
    setFilePreview(getImageUrl(item));
    setEditingId(item._id);
    setShowForm(true);
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!editingId && !file) {
      alert("Please choose a newspaper clipping image.");
      return;
    }

    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });
    if (file) {
      data.append("image", file);
    }

    try {
      if (editingId) {
        await api.put(`/media-coverages/${editingId}`, data);
      } else {
        await api.post("/media-coverages", data);
      }
      setShowForm(false);
      loadCoverages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save media coverage");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this media coverage clipping?")) return;
    try {
      await api.delete(`/media-coverages/${id}`);
      loadCoverages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete media coverage");
    }
  }

  async function handleSeedDefault() {
    if (!confirm("Import all 32 default newspaper clippings into database for editing?")) return;
    setSeeding(true);
    try {
      await api.post("/media-coverages/seed", { articles: mediaArticles });
      alert("Successfully imported all clippings into database!");
      loadCoverages();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to seed default clippings");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div className="media-coverage-editor">
      <div className="media-coverage-editor-header">
        <div>
          <h1 className="media-coverage-editor-title">Media Coverage Clippings</h1>
          <p className="media-coverage-editor-sub">
            Add, update, and manage print newspaper clippings and digital coverage shown on the website
          </p>
        </div>
        <div className="media-coverage-header-actions">
          {coverages.length === 0 && (
            <button
              type="button"
              className="media-coverage-seed-btn"
              onClick={handleSeedDefault}
              disabled={seeding}
              title="Import default articles to DB"
            >
              <UploadCloud size={16} />
              {seeding ? "Importing..." : "Import 32 Default Clippings"}
            </button>
          )}
          <button type="button" className="media-coverage-add-btn" onClick={openAddForm}>
            <Plus size={16} /> Add Clipping
          </button>
        </div>
      </div>

      {loading ? (
        <p className="media-coverage-loading">Loading media coverages...</p>
      ) : (
        <div className="media-coverage-list">
          {coverages.length === 0 && (
            <div className="media-coverage-empty-state">
              <p>No clippings stored in database yet.</p>
              <p className="hint">
                The website is currently showing the 32 default newspaper clippings. Click{" "}
                <strong>"Import 32 Default Clippings"</strong> above to manage them directly from this panel, or click{" "}
                <strong>"Add Clipping"</strong> to create a new one.
              </p>
            </div>
          )}

          {coverages.map((item) => {
            const imgSrc = getImageUrl(item);
            const formattedDate = formatDisplayDate(item.date, item.displayDate);

            return (
              <div key={item._id} className="media-coverage-row">
                {imgSrc && (
                  <img
                    src={imgSrc}
                    alt={item.title || item.newspaper}
                    className="media-coverage-thumb"
                  />
                )}

                <div className="media-coverage-info">
                  <div className="media-coverage-row-top">
                    <span className="media-coverage-date-tag">
                      <Calendar size={13} />
                      <span>{formattedDate}</span>
                    </span>
                    {(item.newspaper || item.city) && (
                      <span className="media-coverage-source-tag">
                        <Newspaper size={13} />
                        <span>{item.newspaper}</span>
                        {item.city && (
                          <span className="media-coverage-city">
                            <MapPin size={11} /> {item.city}
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  <h4 className="media-coverage-name">
                    {item.title || item.newspaper || "Untitled Clipping"}
                  </h4>

                  {item.description && (
                    <p className="media-coverage-desc-preview">{item.description}</p>
                  )}

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="media-coverage-link-preview"
                    >
                      <ExternalLink size={12} /> {item.linkText || "Read Article"}
                    </a>
                  )}
                </div>

                <div className="media-coverage-actions">
                  <button
                    type="button"
                    title="Edit Clipping"
                    onClick={() => openEditForm(item)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    title="Delete Clipping"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="media-coverage-modal-overlay">
          <form className="media-coverage-modal" onSubmit={handleSubmit}>
            <div className="media-coverage-modal-header">
              <h2>{editingId ? "Edit Media Clipping" : "Add New Media Clipping"}</h2>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="media-coverage-modal-body">
              {/* Row 1: Date & Display Date */}
              <div className="form-row-two">
                <div className="form-group">
                  <label>
                    Date <span className="required-tag">Required</span>
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                  <small className="field-hint">Used for sorting and month-year grouping</small>
                </div>

                <div className="form-group">
                  <label>Display Date (Custom Text)</label>
                  <input
                    type="text"
                    value={form.displayDate}
                    onChange={(e) => setForm({ ...form, displayDate: e.target.value })}
                    placeholder="e.g. 11 सितंबर 2026 (शुक्रवार)"
                  />
                  <small className="field-hint">Leave blank to auto-format from Date</small>
                </div>
              </div>

              {/* Row 2: Title & Newspaper */}
              <div className="form-row-two">
                <div className="form-group">
                  <label>Title / Headline</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. भरोसा ग्रुप (Official Statement)"
                  />
                </div>

                <div className="form-group">
                  <label>Newspaper / Publication</label>
                  <input
                    type="text"
                    value={form.newspaper}
                    onChange={(e) => setForm({ ...form, newspaper: e.target.value })}
                    placeholder="e.g. दैनिक भास्कर"
                  />
                </div>
              </div>

              {/* Row 3: City */}
              <div className="form-group">
                <label>City / Location</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g. फरीदाबाद, नई दिल्ली, चंडीगढ़"
                />
              </div>

              {/* Row 4: Image Upload */}
              <div className="form-group">
                <label>
                  Clipping Photo {!editingId && <span className="required-tag">Required</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required={!editingId}
                />
                {filePreview && (
                  <div className="image-preview-box">
                    <img src={filePreview} alt="Preview" />
                  </div>
                )}
                {editingId && !file && (
                  <p className="field-hint">Existing image will be kept if no new file is selected</p>
                )}
              </div>

              {/* Row 5: Description */}
              <div className="form-group">
                <label>Description / Summary (Optional)</label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short note or summary of the news article..."
                />
              </div>

              {/* Row 6: Link & Link Text */}
              <div className="form-row-two">
                <div className="form-group">
                  <label>External Link / E-Paper URL (Optional)</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    placeholder="https://epaper.bhaskar.com/..."
                  />
                </div>

                <div className="form-group">
                  <label>Link Button Label</label>
                  <input
                    type="text"
                    value={form.linkText}
                    onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                    placeholder="ई-पेपर / खबर पढ़ें"
                  />
                </div>
              </div>
            </div>

            <div className="media-coverage-modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : editingId ? "Update Clipping" : "Save Clipping"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

