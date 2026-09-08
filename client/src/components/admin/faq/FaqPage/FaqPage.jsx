import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import "../../shared/formCard.css";
import api from "../../../../api/axios";

export default function FaqPage() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function fetchFaqs(page = 1) {
    setLoading(true);
    try {
      const res = await api.get(`/faqs?page=${page}&limit=10`);
      if (res.data && res.data.faqs) {
        setFaqs(res.data.faqs);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.page || 1);
      }
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFaqs(currentPage);
  }, [currentPage]);

  const filteredFaqs = faqs.filter((f) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (f.question || "").toLowerCase().includes(q) ||
      (f.answer || "").toLowerCase().includes(q) ||
      String(f.id).includes(q)
    );
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setSubmitting(true);

    try {
      await api.post("/faqs", { question: question.trim(), answer: answer.trim() });
      showSuccessAlert("FAQ created successfully!", 1200);
      setQuestion("");
      setAnswer("");
      fetchFaqs(1);
    } catch (err) {
      console.error("Failed to create FAQ:", err);
      showErrorAlert(err.response?.data?.message || "Failed to create FAQ");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/faq/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this FAQ item!",
      deletedText: "FAQ item has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/faqs/${id}`);
          setFaqs((prev) => prev.filter((f) => f.id !== id && f._id !== id));
        } catch (err) {
          console.error("Failed to delete FAQ:", err);
          showErrorAlert("Failed to delete FAQ");
        }
      },
    });
  }

  return (
    <div className="fc-page-wrap">
      {/* Add FAQ */}
      <div className="fc-card">
        <div className="fc-card-header">
          <h4 className="fc-card-title">Add FAQ</h4>
        </div>
        <div className="fc-card-body">
          <form onSubmit={handleSubmit}>
            <div className="fc-form-group">
              <label>Question</label>
              <input
                type="text"
                placeholder="e.g. How can I book a ride?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>
            <div className="fc-form-group">
              <label>Answer</label>
              <textarea
                rows={4}
                placeholder="Enter detailed answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="fc-submit-btn" disabled={submitting}>
              {submitting ? "Saving..." : "Submit"}
            </button>
          </form>
        </div>
      </div>

      {/* Added FAQ */}
      <div className="fc-card">
        <div className="fc-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h4 className="fc-card-title">Added FAQ [{faqs.length}]</h4>
          <input
            type="search"
            placeholder="Search FAQs..."
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
        <div className="fc-card-body">
          <div className="fc-table-wrap">
            <table className="fc-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Question</th>
                  <th>Answer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)" }}>
                      Loading FAQs...
                    </td>
                  </tr>
                ) : filteredFaqs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="fc-no-data">
                      No FAQs found
                    </td>
                  </tr>
                ) : (
                  filteredFaqs.map((f, i) => (
                    <tr key={f.id || f._id}>
                      <td>{(currentPage - 1) * 10 + i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{f.question}</td>
                      <td>{f.answer}</td>
                      <td>
                        <div className="fc-action-icons">
                          <button
                            className="fc-icon-btn edit"
                            onClick={() => handleEdit(f.id || f._id)}
                            title="Edit FAQ"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="fc-icon-btn delete"
                            onClick={() => handleDelete(f.id || f._id)}
                            title="Delete FAQ"
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

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
