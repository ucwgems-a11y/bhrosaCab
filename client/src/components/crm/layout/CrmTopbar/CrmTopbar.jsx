import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, ArrowRight, Sun, Moon, LogOut, User, Lock } from "lucide-react";
import { useCrmAuth } from "../../../../context/CrmAuthContext";
import { useTheme } from "../../../../context/ThemeContext";
import { SERVER_URL } from "../../../../config";
import logo from "../../../../assets/img/bharosa-logo-yellow.png";
import "./CrmTopbar.css";

export default function CrmTopbar({ onToggleSidebar, isSidebarOpen = true }) {
  const { subAdmin, logout } = useCrmAuth();
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
    <header className="crm-topbar">
      <div className="crm-topbar-left">
        <button
          className="crm-topbar-menu-btn"
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isSidebarOpen ? <Menu size={22} /> : <ArrowRight size={22} />}
        </button>
      </div>

      <div className="crm-topbar-right" ref={menuRef}>
        {/* Dark / Light Mode Toggle */}
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

        <div className="crm-topbar-vertical-divider" />

        {/* Profile and Name Trigger */}
        <button
          className="crm-topbar-profile-trigger"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <div className="crm-topbar-avatar-wrap">
            <img
              src={
                subAdmin?.profileImage
                  ? subAdmin.profileImage.startsWith("http")
                    ? subAdmin.profileImage
                    : `${SERVER_URL}${subAdmin.profileImage.startsWith("/") ? "" : "/"}${subAdmin.profileImage}`
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(subAdmin?.name || "SubAdmin")}&background=0D8ABC&color=fff`
              }
              alt="Sub Admin"
              className="crm-topbar-avatar"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(subAdmin?.name || "SubAdmin")}&background=0D8ABC&color=fff`;
              }}
            />
          </div>
          <span className="crm-topbar-name">
            {subAdmin?.name || "Ritesh Kumar"}
          </span>
        </button>

        {menuOpen && (
          <div className="crm-topbar-dropdown">
            <button
              className="crm-topbar-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                navigate("/crm-profile");
              }}
            >
              <User size={18} className="crm-topbar-dropdown-icon" />
              <span>Profile</span>
            </button>

            <button
              className="crm-topbar-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                navigate("/crm-change-password");
              }}
            >
              <Lock size={18} className="crm-topbar-dropdown-icon crm-topbar-dropdown-icon-accent" />
              <span>Change Password</span>
            </button>

            <button
              className="crm-topbar-dropdown-item"
              onClick={() => {
                setMenuOpen(false);
                logout?.();
                navigate("/crm-login");
              }}
            >
              <LogOut size={18} className="crm-topbar-dropdown-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
