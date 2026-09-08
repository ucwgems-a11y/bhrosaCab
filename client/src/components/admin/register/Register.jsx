import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import loginVideo from "../../../assets/video/FinaloutofCab/FinaloutofCab.mp4";
import logo from "../../../assets/img/bharosa-logo-yellow.png";
import "./Register.css";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [nickName, setNickName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    Swal.fire({
      icon: "info",
      title: "Disabled in Production",
      text: "Admin registration and password reset are disabled for security in production.",
    });
    /*
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please enter both Email and Password.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        name: name || "Admin",
        nickName: nickName || "Admin",
        email,
        password,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: res.data?.message || "Admin registered / password updated successfully!",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/admin/login");
      }, 1500);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.message || "Could not register admin. Make sure backend server is running.",
      });
    } finally {
      setLoading(false);
    }
    */
  }

  const videoSrc = import.meta.env.VITE_LOGIN_VIDEO_URL || loginVideo;

  return (
    <div className="admin-reg-screen">
      <video className="admin-reg-video" autoPlay muted loop playsInline>
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="admin-reg-overlay" />

      <form className="admin-reg-card" onSubmit={handleSubmit}>
        <img src={logo} alt="Bhrosa Cab" className="admin-reg-logo" />
        <h1>Admin Registration</h1>
        <p className="admin-reg-note">
          ⚠️ Register new Admin or reset password for existing email.
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name (e.g. Super Admin)"
        />

        <input
          type="text"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
          placeholder="Nick Name / Display Name"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Email *"
          required
        />

        <div className="admin-reg-password-wrap">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter New Password *"
            required
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </span>
        </div>

        <button type="submit" className="admin-reg-btn" disabled={loading}>
          {loading ? "Registering..." : "Register / Update Admin"}
        </button>

        <div className="admin-reg-links">
          <Link to="/admin/login">Back to Admin Login</Link>
        </div>
      </form>
    </div>
  );
}
