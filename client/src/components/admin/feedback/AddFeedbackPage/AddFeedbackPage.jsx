import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import "./AddFeedbackPage.css";

// TODO: on submit, POST { title, emoji: file } to /api/feedback/emojis
// (use FormData since an image file is involved, same pattern as Hero/About editors)
export default function AddFeedbackPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      showSuccessAlert("Your work has been saved", 1000);
      setTimeout(() => {
        navigate("/admin/feedback/manage");
      }, 1000);
    }, 300);
  }

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/feedback/manage")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--card-bg, #1a222d)",
            color: "var(--text-main, #fff)",
            border: "1px solid var(--border-color, #2a3441)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Manage Feedback</span>
        </button>
      </div>

      <h1 className="feedback-page-title">User Mood Emoji Add</h1>

      <form className="feedback-form-card" onSubmit={handleSubmit}>
        <h2 className="feedback-form-heading">Add Emoji</h2>

        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Emoji</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit" className="feedback-submit-btn" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}