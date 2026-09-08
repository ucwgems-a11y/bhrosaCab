import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete } from "../../../../utils/sweetAlert";
import "./ManageFeedbackPage.css";

// TODO: Backend connect hone par API se data aayega (GET /api/feedback/emojis)
const initialEmojis = [
  {
    id: 1,
    image: "https://bhrosacab.com/uploads/feedback_images/bc9eb31a-8bef-405d-b853-136ca14cbd1a.png",
    title: "Happy",
  },
  {
    id: 2,
    image: "https://bhrosacab.com/uploads/feedback_images/ef6b1e8c-4718-4315-879d-a7b2f67aa4ea.png",
    title: "Cutie",
  },
  {
    id: 3,
    image: "https://bhrosacab.com/uploads/feedback_images/afed6a14-f015-47f7-9f81-a2eaec3fdb49.png",
    title: "Cool",
  },
  {
    id: 4,
    image: "https://bhrosacab.com/uploads/feedback_images/c432a7c3-c877-448b-9654-21dd0ff6f83c.png",
    title: "Laugh",
  },
  {
    id: 5,
    image: "https://bhrosacab.com/uploads/feedback_images/132fd860-261e-4e74-a946-0920b5f9995c.png",
    title: "Mood Swing",
  },
  {
    id: 6,
    image: "https://bhrosacab.com/uploads/feedback_images/71b735a5-d3f2-4471-9613-048e2b9d5f97.png",
    title: "Mute",
  },
];

export default function ManageFeedbackPage() {
  const navigate = useNavigate();
  const [emojis, setEmojis] = useState(initialEmojis);
  const [search, setSearch] = useState("");

  const filteredEmojis = emojis.filter((e) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (e.title || "").toLowerCase().includes(q) ||
      String(e.id).includes(q)
    );
  });

  const handleEdit = (id) => {
    navigate(`/admin/feedback/edit/${id}`);
  };

  const handleDelete = (id) => {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this feedback emoji!",
      deletedText: "Feedback emoji has been deleted.",
      onConfirm: () => {
        setEmojis((prev) => prev.filter((e) => e.id !== id));
      },
    });
  };

  return (
    <div className="feedback-page">
      {/* ================= MAIN CARD ================= */}
      <div className="feedback-card">
        {/* CARD HEADER */}
        <div className="feedback-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h4>User Mood Emoji Manage</h4>
          <input
            type="search"
            placeholder="Search emoji title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-color, #334155)",
              background: "var(--bg-main, #0f172a)",
              color: "var(--text-main, #fff)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        {/* CARD BODY */}
        <div className="feedback-card-body">
          {/* TABLE */}
          <div className="feedback-table-wrapper">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Sr.no</th>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmojis.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="feedback-no-data">
                      No emojis found
                    </td>
                  </tr>
                ) : (
                  filteredEmojis.map((row, index) => (
                    <tr key={row.id}>
                      {/* SR NO */}
                      <td>{index + 1}</td>

                      {/* IMAGE */}
                      <td className="feedback-image-cell">
                        <img
                          src={row.image}
                          alt={row.title}
                          className="feedback-emoji-image"
                        />
                      </td>

                      {/* TITLE */}
                      <td>{row.title}</td>

                      {/* ACTION */}
                      <td>
                        <div className="feedback-actions">
                          {/* EDIT */}
                          <button
                            type="button"
                            className="feedback-edit-btn"
                            title="Edit"
                            onClick={() => handleEdit(row.id)}
                          >
                            <Pencil size={14} />
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            className="feedback-delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(row.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}