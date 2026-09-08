import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import loginVideo from "../../../assets/video/FinaloutofCab/FinaloutofCab.mp4";
import logo from "../../../assets/img/bharosa-logo-yellow.png";
import "./CrmLogin.css";

export default function CrmLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ipAddress, setIpAddress] = useState(() => localStorage.getItem("crm_system_ip") || "Detecting...");
  const [loading, setLoading] = useState(false);
  const [detectingIp, setDetectingIp] = useState(false);
  const { login } = useCrmAuth();
  const navigate = useNavigate();

  // Persistent System IP on this machine
  useEffect(() => {
    let isMounted = true;
    async function initSystemIp() {
      // 1. If already saved on this system, use it directly
      const savedIp = localStorage.getItem("crm_system_ip");
      if (savedIp) {
        if (isMounted) setIpAddress(savedIp);
        return;
      }

      // 2. First time detection: fetch and permanently store on this system
      setDetectingIp(true);
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        if (isMounted && data.ip) {
          localStorage.setItem("crm_system_ip", data.ip);
          setIpAddress(data.ip);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = "49.43.110.253";
          localStorage.setItem("crm_system_ip", fallback);
          setIpAddress(fallback);
        }
      } finally {
        if (isMounted) setDetectingIp(false);
      }
    }
    initSystemIp();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshIp = async () => {
    setDetectingIp(true);
    setIpAddress("Detecting...");
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      if (data.ip) {
        localStorage.setItem("crm_system_ip", data.ip);
        setIpAddress(data.ip);
      }
    } catch (err) {
      const fallback = "49.43.110.253";
      localStorage.setItem("crm_system_ip", fallback);
      setIpAddress(fallback);
    } finally {
      setDetectingIp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please enter both email and password.",
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password, ipAddress);

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        text: "Welcome to CRM Dashboard",
        timer: 1800,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/crm-dashboard");
      }, 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.message === "Network Error"
          ? "Backend server is offline or IP mismatch."
          : "Invalid email, password, or IP not authorized.");

      Swal.fire({
        icon: "error",
        title: "CRM Login Failed",
        text: errorMsg,
        confirmButtonColor: "#5ea2a3",
      });
    } finally {
      setLoading(false);
    }
  };

  const videoSrc = import.meta.env.VITE_LOGIN_VIDEO_URL || loginVideo;

  return (
    <div className="crm-login-container">
      <video className="crm-login-video" autoPlay muted loop playsInline>
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="crm-login-backdrop-overlay" />

      <div className="crm-login-box">
        <div className="crm-brand-header">
          <div className="crm-brand-logo-wrap">
            <img
              src={logo}
              alt="Bhrosa Cab Logo"
              className="crm-brand-logo"
            />
          </div>
          <h4 className="crm-login-title">CRM Login</h4>
        </div>

        <form onSubmit={handleSubmit} className="crm-form-section" noValidate>
          <div className="crm-form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter email"
              className="crm-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              required
            />
          </div>

          <div className="crm-form-group crm-password-group">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter Password"
              className="crm-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              required
            />
            <span
              className="crm-toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          {/* Hidden input field for IP address */}
          <input type="hidden" id="ip_address" name="ip_address" value={ipAddress} />

          <div id="ip-message" className="crm-ip-message">
            <span>System IP: <strong>{ipAddress}</strong></span>
            <button
              type="button"
              onClick={handleRefreshIp}
              title="Re-detect IP"
              className="crm-refresh-ip-btn"
              disabled={detectingIp}
            >
              <RefreshCw size={12} className={detectingIp ? "crm-spin-icon" : ""} />
            </button>
          </div>

          <button
            type="submit"
            className="crm-login-submit-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
