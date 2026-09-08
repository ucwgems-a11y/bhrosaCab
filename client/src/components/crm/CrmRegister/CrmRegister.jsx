import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import logo from "../../../assets/img/bharosa-logo-yellow.png";
import taxiBg from "../../../assets/img/taxi-background.png";
import "./CrmRegister.css";

export default function CrmRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    country: "India",
    state: "",
    city: "",
    ipAddress: "",
    ipStatus: true,
  });
  const [detectedIp, setDetectedIp] = useState("Detecting...");
  const [loading, setLoading] = useState(false);
  const { register } = useCrmAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchIp() {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        if (data.ip) {
          setDetectedIp(data.ip);
          setFormData((prev) => ({ ...prev, ipAddress: data.ip }));
        }
      } catch (err) {
        setDetectedIp("49.43.110.253");
        setFormData((prev) => ({ ...prev, ipAddress: "49.43.110.253" }));
      }
    }
    fetchIp();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter Name, Email, and Password.",
      });
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      Swal.fire({
        icon: "success",
        title: "Sub-Admin Registered!",
        text: "You can now log in to the CRM panel with your credentials and authorized IP.",
      });
      navigate("/crm-login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.message || "Could not register Sub-Admin account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="crm-reg-container"
      style={{ backgroundImage: `url(${taxiBg})` }}
    >
      <div className="crm-reg-backdrop-overlay" />

      <div className="crm-reg-box">
        <div className="crm-reg-header">
          <img src={logo} alt="Logo" className="crm-reg-logo" />
          <h4>Register Sub-Admin (Testing Route)</h4>
          <p className="crm-reg-subtext">
            ⚠️ This route is created for initial Sub-Admin creation & IP testing. It can be commented out later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="crm-reg-form">
          <div className="crm-reg-field">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Sub Admin Manager"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="crm-reg-field">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. subadmin@bhrosacab.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="crm-reg-field">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Enter secure password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="crm-reg-field">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="Mobile Number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="crm-reg-field">
            <label>Allowed IP Address (Auto-detected: {detectedIp})</label>
            <input
              type="text"
              name="ipAddress"
              placeholder="e.g. 49.43.110.253 or comma-separated IPs"
              value={formData.ipAddress}
              onChange={handleChange}
            />
            <small>Leave empty or set * to allow any IP for testing.</small>
          </div>

          <div className="crm-reg-checkbox">
            <label>
              <input
                type="checkbox"
                name="ipStatus"
                checked={formData.ipStatus}
                onChange={handleChange}
              />
              Enable Strict IP Address Matching
            </label>
          </div>

          <button type="submit" className="crm-reg-btn" disabled={loading}>
            {loading ? "Creating Sub-Admin..." : "Create Sub-Admin"}
          </button>
        </form>

        <div className="crm-reg-footer">
          <Link to="/crm-login" className="crm-reg-back">
            Back to CRM Login
          </Link>
        </div>
      </div>
    </div>
  );
}
