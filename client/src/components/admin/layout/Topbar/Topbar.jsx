import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ArrowRight, User, Lock, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import { useTheme } from "../../../../context/ThemeContext";
import { SERVER_URL } from "../../../../config";
import logo from "../../../../assets/img/bharosa-logo-yellow.png";
import "./Topbar.css";

export default function Topbar({ onToggleSidebar, isSidebarOpen = true }) {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <Menu size={22} /> : <ArrowRight size={22} />}
        </button>
      </div>

      <div className="topbar-right" ref={menuRef}>
        <div
          className={`theme-switch-capsule ${isDark ? "dark" : "light"}`}
          onClick={toggleTheme}
          role="button"
          tabIndex={0}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <span className="theme-switch-icon sun">
            <Sun size={14} strokeWidth={2.2} />
          </span>
          <span className="theme-switch-thumb" />
          <span className="theme-switch-icon moon">
            <Moon size={13} strokeWidth={2.2} />
          </span>
        </div>

        <div className="topbar-vertical-divider" />

        <button
          className="topbar-profile-trigger"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <div className="topbar-avatar-wrap">
            <img
              src={
                admin?.avatar
                  ? admin.avatar.startsWith("http")
                    ? admin.avatar
                    : `${SERVER_URL}${admin.avatar.startsWith("/") ? "" : "/"}${admin.avatar}`
                  : logo
              }
              alt="admin"
              className="topbar-avatar"
              onError={(e) => {
                e.target.src = logo;
              }}
            />
          </div>
          <span className="topbar-admin-name">
            {admin?.nickName || admin?.name || "Admin"}
          </span>
        </button>

        {menuOpen && (
          <div className="topbar-dropdown">
            <button
              className="topbar-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                navigate("/admin/profile");
              }}
            >
              <User size={18} className="topbar-dropdown-icon" />
              <span>Profile</span>
            </button>

            <button
              className="topbar-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                navigate("/admin/change-password");
              }}
            >
              <Lock size={18} className="topbar-dropdown-icon topbar-dropdown-icon-accent" />
              <span>Change Password</span>
            </button>

            <button
              className="topbar-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                logout?.();
                navigate("/admin/login");
              }}
            >
              <LogOut size={18} className="topbar-dropdown-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}