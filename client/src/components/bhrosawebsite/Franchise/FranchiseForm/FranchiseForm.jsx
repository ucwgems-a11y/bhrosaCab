import { useState } from "react";
import "./FranchiseForm.css";
import { FiUser, FiMail, FiMapPin } from "react-icons/fi";
import api from "../../../../api/axios";

function FranchiseForm() {
  const [form, setForm] = useState({ name: "", email: "", state: "", city: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // "success" | "error" | null

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await api.post("/franchise-applications", form);
      setStatus("success");
      setForm({ name: "", email: "", state: "", city: "" });
    } catch (err) {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="franchise-form-section">
      <div className="container">
        <div className="franchise-form-wrapper">
          <form className="franchise-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <FiUser className="form-icon" />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <FiMail className="form-icon" />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="state"
                placeholder="State"
                value={form.state}
                onChange={handleChange}
                required
              />
              <FiMapPin className="form-icon" />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                required
              />
              <FiMapPin className="form-icon" />
            </div>

            {status === "success" && (
              <p className="form-status success">Thank you! Your application has been submitted.</p>
            )}
            {status === "error" && (
              <p className="form-status error">Something went wrong. Please try again.</p>
            )}

            <div className="submit-wrapper">
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default FranchiseForm;