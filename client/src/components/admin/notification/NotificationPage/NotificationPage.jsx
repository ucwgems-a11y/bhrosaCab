import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import "../../shared/formCard.css";

export default function NotificationPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSending(true);

    setTimeout(() => {
      setSending(false);
      showSuccessAlert("Your work has been saved", 1000);
      setTitle("");
      setMessage("");
    }, 300);
  }

  return (
    <div className="fc-page-wrap">
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate(-1)}
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
          <span>Back</span>
        </button>
      </div>

      <div className="fc-card">
        <div className="fc-card-header">
          <h4 className="fc-card-title">Send Push Notification</h4>
        </div>
        <div className="fc-card-body">
          <form onSubmit={handleSubmit}>
            <div className="fc-form-group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="fc-form-group">
              <label>Message:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button type="submit" className="fc-submit-btn" disabled={sending}>
              {sending ? "Sending..." : "Send Notification"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}