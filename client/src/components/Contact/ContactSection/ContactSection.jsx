import { useEffect, useState, Fragment } from "react";
import "./ContactSection.css";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaClock,
} from "react-icons/fa";

import worldMap from "../../../assets/img/map.png";
import api from "../../../api/axios";

function ContactSection() {
  const [info, setInfo] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get("/contact-info").then((res) => setInfo(res.data));
    api.get("/company-info").then((res) => setCompanyInfo(res.data));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await api.post("/contact-messages", form);
      setStatus("success");
      setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
    } catch (err) {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!info || !companyInfo) return null;

  const addressLines = (companyInfo.address || "").split("\n");

  return (
    <section className="contact-section-custom">
      <div className="contact-map-bg" style={{ backgroundImage: `url(${worldMap})` }}></div>

      <div className="container">
        <div className="contact-wrapper">
          {/* LEFT */}
          <div className="contact-left">
            <h2>
              {info.highlight
                ? info.heading.split(info.highlight)[0]
                : info.heading}
              {info.highlight && <span>{info.highlight}</span>}
            </h2>

            <p>{info.description}</p>

            <h3>{info.companyName}</h3>

            <div className="contact-item">
              <div className="icon-box">
                <FaMapMarkerAlt />
              </div>
              <p>
                {addressLines.map((line, i) => (
                  <Fragment key={i}>
                    {line}
                    {i < addressLines.length - 1 && <br />}
                  </Fragment>
                ))}
              </p>
            </div>

            <div className="contact-item">
              <div className="icon-box">
                <FaEnvelope />
              </div>
              <p>{companyInfo.email}</p>
            </div>

            <div className="contact-item">
              <div className="icon-box">
                <FaPhoneAlt />
              </div>
              <p>{companyInfo.phone}</p>
            </div>

            <div className="contact-item">
              <div className="icon-box">
                <FaClock />
              </div>
              <div>
                <p>{info.workingHours}</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="contact-right">
            <h2>Contact With Us!</h2>

            <form className="contact-form-grid" onSubmit={handleSubmit}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={form.firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={form.lastName}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
              />
              <textarea
                rows="5"
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
                required
              ></textarea>

              {status === "success" && (
                <p className="contact-form-status success">Thank you! Your message has been sent.</p>
              )}
              {status === "error" && (
                <p className="contact-form-status error">Something went wrong. Please try again.</p>
              )}

              <button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;