import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Smile, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import "./EditFeedbackPage.css";

const mockEmojiData = {
  1: { title: "Happy", image: "https://bhrosacab.com/uploads/feedback_images/bc9eb31a-8bef-405d-b853-136ca14cbd1a.png" },
  2: { title: "Cutie", image: "https://bhrosacab.com/uploads/feedback_images/ef6b1e8c-4718-4315-879d-a7b2f67aa4ea.png" },
  3: { title: "Cool", image: "https://bhrosacab.com/uploads/feedback_images/afed6a14-f015-47f7-9f81-a2eaec3fdb49.png" },
  4: { title: "Laugh", image: "https://bhrosacab.com/uploads/feedback_images/c432a7c3-c877-448b-9654-21dd0ff6f83c.png" },
  5: { title: "Mood Swing", image: "https://bhrosacab.com/uploads/feedback_images/132fd860-261e-4e74-a946-0920b5f9995c.png" },
  6: { title: "Mute", image: "https://bhrosacab.com/uploads/feedback_images/71b735a5-d3f2-4471-9613-048e2b9d5f97.png" },
};

export default function EditFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = mockEmojiData[id] || { title: "Mood Emoji", image: "https://ui-avatars.com/api/?name=Emoji&background=e8873a&color=fff" };

  const [title, setTitle] = useState(existing.title);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existing.image);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setPreviewUrl(existing.image);
    }
  }, [id]);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setShowSuccess(true);
      showSuccessAlert("Your work has been saved", 1000);
      setTimeout(() => {
        navigate("/admin/feedback/manage");
      }, 1000);
    }, 300);
  }

  function handleCancel() {
    navigate("/admin/feedback/manage");
  }

  return (
    <div className="edit-feedback-page">
      {/* Topbar Back Navigation */}
      <div className="edit-feedback-topbar">
        <button className="edit-feedback-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Manage Feedback</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-feedback-alert-success">
          <CheckCircle2 size={18} />
          <span>Mood emoji <strong>{title}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-feedback-card">
        <div className="edit-feedback-card-header">
          <div className="edit-feedback-header-icon">
            <Smile size={20} />
          </div>
          <div>
            <h3 className="edit-feedback-card-title">Edit Mood Emoji</h3>
            <p className="edit-feedback-card-subtitle">
              Update reaction emotion &amp; sticker image for Reaction #{id}
            </p>
          </div>
        </div>

        <div className="edit-feedback-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-feedback-form-group">
              <label>
                Emoji / Mood Title <span className="edit-feedback-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Happy, Cool, Laugh"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="edit-feedback-form-group">
              <label>Emoji Sticker Graphic</label>
              <div className="edit-feedback-image-row">
                {previewUrl && (
                  <div className="edit-feedback-preview-box">
                    <img src={previewUrl} alt="Emoji Preview" />
                  </div>
                )}
                <label className="edit-feedback-upload-btn">
                  <Upload size={16} />
                  <span>Upload New Emoji Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div className="edit-feedback-actions">
              <button
                type="submit"
                className="edit-feedback-btn-submit"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Emoji"}
              </button>
              <button
                type="button"
                className="edit-feedback-btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}