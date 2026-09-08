import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HelpCircle, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditFaqPage.css";

export default function EditFaqPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchFaqDetails() {
      setLoading(true);
      try {
        const res = await api.get(`/faqs/${id}`);
        if (res.data && res.data.faq) {
          setQuestion(res.data.faq.question);
          setAnswer(res.data.faq.answer);
        }
      } catch (err) {
        console.error("Failed to fetch FAQ details:", err);
        showErrorAlert("Failed to load FAQ details");
      } finally {
        setLoading(false);
      }
    }
    fetchFaqDetails();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setSubmitting(true);

    try {
      await api.put(`/faqs/${id}`, { question: question.trim(), answer: answer.trim() });
      setShowSuccess(true);
      showSuccessAlert("FAQ updated successfully!", 1200);
      setTimeout(() => {
        navigate("/admin/faq/manage");
      }, 1000);
    } catch (err) {
      console.error("Failed to update FAQ:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update FAQ");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/faq/manage");
  }

  return (
    <div className="edit-faq-page">
      <div className="edit-faq-topbar">
        <button className="edit-faq-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Manage FAQ</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-faq-alert-success">
          <CheckCircle2 size={18} />
          <span>FAQ entry updated successfully!</span>
        </div>
      )}

      <div className="edit-faq-card">
        <div className="edit-faq-card-header">
          <div className="edit-faq-header-icon">
            <HelpCircle size={20} />
          </div>
          <div>
            <h3 className="edit-faq-card-title">Edit FAQ</h3>
            <p className="edit-faq-card-subtitle">
              Update Frequently Asked Question #{id}
            </p>
          </div>
        </div>

        <div className="edit-faq-card-body">
          {loading ? (
            <div style={{ color: "var(--text-muted)", padding: "20px" }}>Loading FAQ details...</div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="edit-faq-form-group">
                <label>
                  Question <span className="edit-faq-req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter FAQ Question..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              <div className="edit-faq-form-group">
                <label>
                  Answer <span className="edit-faq-req">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Enter FAQ Answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                />
              </div>

              <div className="edit-faq-actions">
                <button
                  type="submit"
                  className="edit-faq-btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update FAQ"}
                </button>
                <button
                  type="button"
                  className="edit-faq-btn-cancel"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
