import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import api from "../../../../../api/axios";
import "./ContactMessagesEditor.css";

export default function ContactMessagesEditor() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadMessages() {
    setLoading(true);
    api
      .get("/contact-messages")
      .then((res) => setMessages(res.data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Remove this message?")) return;
    await api.delete(`/contact-messages/${id}`);
    loadMessages();
  }

  return (
    <div className="contact-messages-editor">
      <h1 className="contact-messages-title">Contact Messages</h1>
      <p className="contact-messages-sub">Messages submitted through the Contact page form</p>

      {loading ? (
        <p className="contact-messages-loading">Loading...</p>
      ) : messages.length === 0 ? (
        <p className="contact-messages-loading">No messages received yet.</p>
      ) : (
        <div className="contact-messages-list">
          {messages.map((msg) => (
            <div key={msg._id} className="contact-message-card">
              <div className="contact-message-top">
                <div>
                  <div className="contact-message-name">
                    {msg.firstName} {msg.lastName}
                  </div>
                  <div className="contact-message-meta">
                    {msg.email} {msg.phone && `• ${msg.phone}`}
                  </div>
                </div>
                <button onClick={() => handleDelete(msg._id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="contact-message-body">{msg.message}</p>
              <div className="contact-message-date">
                {new Date(msg.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}