import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Shield, ReceiptText } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Swal from "sweetalert2";
import loginVideo from "../../../assets/video/FinaloutofCab/FinaloutofCab.mp4";
import logo from "../../../assets/img/bharosa-logo-yellow.png";
import "./Login.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

 async function handleSubmit(e) {

  e.preventDefault();

  setError("");
  setLoading(true);

  try {

    await login(email, password);


    Swal.fire({
      title: "Login Successful!",
      text: "Welcome to Admin Dashboard",
      icon: "success",
      draggable: true,
      timer: 2000,
      showConfirmButton: false
    });


    navigate("/admin/dashboard");


  } catch (err) {
    const errorMsg =
      err.response?.data?.message ||
      (err.message === "Network Error"
        ? "Unable to connect to the server. Please verify your connection."
        : "Invalid email or password. Please try again.");

    Swal.fire({
      title: "Login Failed",
      text: errorMsg,
      icon: "error"
    });

    setError(errorMsg);
  } finally {

    setLoading(false);

  }

}

  const videoSrc = import.meta.env.VITE_LOGIN_VIDEO_URL || loginVideo;

  return (
    <div className="admin-login-screen">
      <video className="admin-login-video" autoPlay muted loop playsInline>
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="admin-login-overlay" />

      <form className="admin-login-card" onSubmit={handleSubmit}>
        <img src={logo} alt="Bhrosa Cab" className="admin-login-logo" />
        <h1>Admin Login</h1>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
        />

        <div className="admin-password-wrap">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            required
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <button type="submit" disabled={loading}>
          Login
        </button>

        <div style={{ marginTop: "14px", fontSize: "12px", textAlign: "center" }}>
          <Link to="/admin/register" style={{ color: "#79c5e8", textDecoration: "none" }}>
            Register Admin / Reset Password
          </Link>
        </div>

        <div className="admin-login-footer-links">
          <a href="https://bhrosacab.com/policy">
            <Shield size={14} /> Privacy Policy
          </a>
          <a href="https://bhrosacab.com/refund-policy">
            <ReceiptText size={14} /> Refund Policy
          </a>
        </div>
      </form>
    </div>
  );
}