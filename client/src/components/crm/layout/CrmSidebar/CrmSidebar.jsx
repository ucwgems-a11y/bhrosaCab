import { useState, useRef } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Bike,
  Car,
  Landmark,
  Banknote,
  ChevronDown,
  Diamond,
} from "lucide-react";
import logo from "../../../../assets/img/bharosa-logo-yellow.png";
import "./CrmSidebar.css";

const userLinks = [
  { label: "User List", to: "/crm-user" },
];

const driverLinks = [
  { label: "Manage Drivers", to: "/crm-user-driver" },
];

const ridesLinks = [
  { label: "Ongoing Rides", to: "/crm-rides-ongoing-manage" },
  { label: "Completed Rides", to: "/crm-rides-completed-manage" },
  { label: "Cancelled Rides", to: "/crm-rides-cancel-manage" },
];

const withdrawalLinks = [
  { label: "Request Withdrawal", to: "/crm-withdrawal" },
  { label: "Withdrawal List", to: "/crm-withdrawal-list" },
];

const menuItems = [
  {
    type: "link",
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/crm-dashboard",
  },
  {
    type: "group",
    id: "users",
    label: "Users",
    icon: User,
    links: userLinks,
  },
  {
    type: "group",
    id: "drivers",
    label: "Drivers",
    icon: Bike,
    links: driverLinks,
  },
  {
    type: "group",
    id: "rides",
    label: "Rides",
    icon: Car,
    links: ridesLinks,
  },
  {
    type: "link",
    id: "bank",
    label: "Bank",
    icon: Landmark,
    to: "/crm-bank-details",
  },
  {
    type: "group",
    id: "withdrawal",
    label: "Withdrawal",
    icon: Banknote,
    links: withdrawalLinks,
  },
];

export default function CrmSidebar({ open = true }) {
  const [openMenu, setOpenMenu] = useState("dashboard");
  const [flyout, setFlyout] = useState(null);
  const timeoutRef = useRef(null);
  const location = useLocation();

  const toggleMenu = (menu) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const handleItemMouseEnter = (item, e) => {
    if (open) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    const isBottomHalf = rect.top > window.innerHeight * 0.6;
    const estimatedHeight = item.type === "group" ? (item.links.length * 36 + 50) : 45;
    const topPos = isBottomHalf 
      ? Math.max(10, rect.bottom - estimatedHeight)
      : Math.max(10, Math.min(rect.top, window.innerHeight - estimatedHeight - 10));

    setFlyout({
      item,
      top: topPos,
    });
  };

  const handleItemMouseLeave = () => {
    if (open) return;
    timeoutRef.current = setTimeout(() => {
      setFlyout(null);
    }, 120);
  };

  const handleFlyoutMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleFlyoutMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setFlyout(null);
    }, 120);
  };

  return (
    <aside className={`crm-sidebar ${open ? "crm-sidebar-open" : "crm-sidebar-collapsed"}`}>
      <div className="crm-sidebar-logo-wrap">
        <Link to="/crm-dashboard" className="crm-sidebar-logo-link">
          <img src={logo} alt="Bhrosa Cab Logo" className="crm-sidebar-logo" />
        </Link>
      </div>

      <div className="crm-sidebar-menu-list">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.type === "link") {
            const isActive = location.pathname === item.to;
            return (
              <div
                key={item.id}
                className="crm-sidebar-item-group"
                onMouseEnter={(e) => handleItemMouseEnter(item, e)}
                onMouseLeave={handleItemMouseLeave}
              >
                <NavLink
                  to={item.to}
                  className={`crm-sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => setFlyout(null)}
                >
                  <Icon size={20} strokeWidth={2.4} />
                  <span className="crm-sidebar-item-label">{item.label}</span>
                </NavLink>
              </div>
            );
          }

          // Expandable group item
          const isGroupOpen = openMenu === item.id;
          const isChildActive = item.links.some(
            (l) =>
              location.pathname === l.to ||
              (l.to !== "/crm" && location.pathname.startsWith(l.to))
          );

          return (
            <div
              key={item.id}
              className="crm-sidebar-item-group"
              onMouseEnter={(e) => handleItemMouseEnter(item, e)}
              onMouseLeave={handleItemMouseLeave}
            >
              <button
                className={`crm-sidebar-item crm-sidebar-parent ${
                  isGroupOpen ? "menu-open" : ""
                } ${isChildActive ? "active" : ""}`}
                onClick={() => toggleMenu(item.id)}
                type="button"
              >
                <Icon size={20} strokeWidth={2.4} />
                <span className="crm-sidebar-item-label">{item.label}</span>
                <ChevronDown
                  size={17}
                  strokeWidth={2.4}
                  className={`crm-sidebar-chevron ${isGroupOpen ? "rotated" : ""}`}
                />
              </button>

              {/* Submenu in Expanded mode */}
              {open && isGroupOpen && (
                <div className="crm-sidebar-submenu">
                  {item.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className="crm-sidebar-subitem"
                    >
                      <Diamond size={10} strokeWidth={2.4} className="crm-sidebar-subitem-dot" />
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Fixed Viewport Flyout (Collapsed Mode) */}
      {!open && flyout && (
        <div
          className="crm-sidebar-flyout crm-sidebar-fixed-flyout"
          style={{ top: `${flyout.top}px` }}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          {flyout.item.type === "link" ? (
            <NavLink
              to={flyout.item.to}
              className="crm-sidebar-flyout-link active"
              onClick={() => setFlyout(null)}
            >
              <span>{flyout.item.label}</span>
            </NavLink>
          ) : (
            <>
              <div className="crm-sidebar-flyout-header">{flyout.item.label}</div>
              <div className="crm-sidebar-flyout-links">
                {flyout.item.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `crm-sidebar-flyout-link ${isActive ? "active" : ""}`
                    }
                    onClick={() => setFlyout(null)}
                  >
                    <Diamond size={8} className="crm-sidebar-flyout-dot" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
