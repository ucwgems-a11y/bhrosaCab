import { useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings,
  ChevronDown,
  Diamond,
  User,
  Car,
  MessageSquare,
  Tag,
  Star,
  Layers,
  Coins,
  Camera,
  X,
  HelpCircle,
  Landmark,
  Send,
  UserCog,
  LayoutGrid,
  ShieldCheck,
  RefreshCcw,
  Bike,
} from "lucide-react";
import logo from "../../../../assets/img/bharosa-logo-yellow.png";
// import logo from "../../../../assets/img/newlogo.png";
import "./Sidebar.css";

const settingsLinks = [
  { label: "Bhrosa Cab Website", to: "/admin/settings/website" },
  { label: "Contact Us", to: "/admin/settings/contact-us" },
  { label: "Manage Emergency", to: "/admin/settings/emergency" },
  { label: "Privacy Policy", to: "/admin/settings/privacy-policy" },
  { label: "Terms & conditions Add", to: "/admin/settings/terms" },
  { label: "About Us Add", to: "/admin/settings/about-us" },
  { label: "App Banner", to: "/admin/settings/app-banner" },
];

const userLinks = [
  { label: "User List", to: "/admin/users/list" },
  { label: "Campaign List", to: "/admin/users/campaigns" },
];

const driverLinks = [
  { label: "Manage Drivers", to: "/admin/drivers/manage" },
  { label: "Drivers Document Verification", to: "/admin/drivers/verification" },
  { label: "Manage Driver Wallet", to: "/admin/drivers/wallet" },
  { label: "Active Drivers", to: "/admin/drivers/active" },
  {
    label: "Active Driver State Wise Count",
    to: "/admin/drivers/active-state-count",
  },
];

const ridesLinks = [
  { label: "Booked Rides", to: "/admin/rides/booked" },
  { label: "Arrived Rides", to: "/admin/rides/arrived" },
  { label: "Ongoing Rides", to: "/admin/rides/ongoing" },
  { label: "Completed Rides", to: "/admin/rides/completed" },
  { label: "Cancelled Rides", to: "/admin/rides/cancelled" },
];

const feedbackLinks = [
  { label: "Add Driver Feedback", to: "/admin/feedback/add" },
  { label: "Manage Feedback", to: "/admin/feedback/manage" },
];

const promoLinks = [
  { label: "Promo Add", to: "/admin/promo/add" },
  { label: "Promo Manage", to: "/admin/promo/manage" },
];

const iconLinks = [{ label: "Add Icon", to: "/admin/icons/add" }];

const carsLinks = [
  { label: "Manage Cars Type", to: "/admin/cars/type" },
  { label: "Manage Cars & Fare", to: "/admin/cars/fare" },
  { label: "Manage Driver Topup", to: "/admin/cars/topup" },
  { label: "Manage Auto Price", to: "/admin/cars/auto-price" },
];

const priceLinks = [{ label: "Manage Price", to: "/admin/price/manage" }];
const tipLinks = [{ label: "Manage Tip-Amount", to: "/admin/tip/manage" }];
const cancelReasonLinks = [
  { label: "Manage Reason", to: "/admin/cancel-reason/manage" },
];
const faqLinks = [{ label: "Manage FAQ", to: "/admin/faq/manage" }];
const bankLinks = [{ label: "Add Bank's", to: "/admin/bank/add" }];
const notificationLinks = [
  { label: "Send notification", to: "/admin/notification/send" },
];
const subAdminLinks = [
  { label: "Add Sub Admin", to: "/admin/subadmin/add" },
  { label: "See Sub Admin", to: "/admin/subadmin/see" },
  { label: "Sub Admin Transaction", to: "/admin/subadmin/transactions" },
];

const menuItems = [
  {
    type: "link",
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/admin/dashboard",
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
    type: "group",
    id: "feedback",
    label: "Driver Feedback",
    icon: MessageSquare,
    links: feedbackLinks,
  },
  {
    type: "group",
    id: "promo",
    label: "Promo",
    icon: Tag,
    links: promoLinks,
  },
  {
    type: "group",
    id: "icons",
    label: "Icon's",
    icon: Star,
    links: iconLinks,
  },
  {
    type: "group",
    id: "cars",
    label: "Cars & Fare",
    icon: Layers,
    links: carsLinks,
  },
  {
    type: "group",
    id: "price",
    label: "Manage Price",
    icon: Coins,
    links: priceLinks,
  },
  {
    type: "group",
    id: "tip",
    label: "Tip",
    icon: Camera,
    links: tipLinks,
  },
  {
    type: "group",
    id: "cancelReason",
    label: "Cancel Reason",
    icon: X,
    links: cancelReasonLinks,
  },
  {
    type: "group",
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    links: faqLinks,
  },
  {
    type: "group",
    id: "bank",
    label: "Bank",
    icon: Landmark,
    links: bankLinks,
  },
  {
    type: "group",
    id: "notification",
    label: "Push Notification",
    icon: Send,
    links: notificationLinks,
  },
  {
    type: "group",
    id: "settings",
    label: "Settings",
    icon: Settings,
    links: settingsLinks,
  },
  {
    type: "group",
    id: "subAdmin",
    label: "Sub Admin",
    icon: UserCog,
    links: subAdminLinks,
  },
  {
    type: "link",
    id: "rechargeHistory",
    label: "Recharge History",
    icon: LayoutGrid,
    to: "/admin/recharge-history",
  },
  {
    type: "link",
    id: "privacyPolicy",
    label: "Privacy Policy",
    icon: ShieldCheck,
    to: "/policy",
  },
  {
    type: "link",
    id: "refundPolicy",
    label: "Refund Policy",
    icon: RefreshCcw,
    to: "/refund-policy",
  },
];

export default function Sidebar({ open }) {
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
    <aside className={`sidebar ${open ? "sidebar-open" : "sidebar-collapsed"}`}>
      <div className="sidebar-logo-wrap">
        <NavLink to="/admin/dashboard" className="sidebar-logo-link">
          <img src={logo} alt="Bhrosa Cab" className="sidebar-logo" />
        </NavLink>
      </div>

      <div className="sidebar-menu-list">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.type === "link") {
            const isActive = location.pathname === item.to;
            return (
              <div
                key={item.id}
                className="sidebar-item-group"
                onMouseEnter={(e) => handleItemMouseEnter(item, e)}
                onMouseLeave={handleItemMouseLeave}
              >
                <NavLink
                  to={item.to}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  onClick={() => setFlyout(null)}
                >
                  <Icon size={20} strokeWidth={2.4} />
                  <span className="sidebar-item-label">{item.label}</span>
                </NavLink>
              </div>
            );
          }

          // Expandable group item
          const isGroupOpen = openMenu === item.id;
          const isChildActive = item.links.some(
            (l) =>
              location.pathname === l.to ||
              (l.to !== "/admin" && location.pathname.startsWith(l.to))
          );

          return (
            <div
              key={item.id}
              className="sidebar-item-group"
              onMouseEnter={(e) => handleItemMouseEnter(item, e)}
              onMouseLeave={handleItemMouseLeave}
            >
              <button
                className={`sidebar-item sidebar-parent ${
                  isGroupOpen ? "menu-open" : ""
                } ${isChildActive ? "active" : ""}`}
                onClick={() => toggleMenu(item.id)}
                type="button"
              >
                <Icon size={20} strokeWidth={2.4} />
                <span className="sidebar-item-label">{item.label}</span>
                <ChevronDown
                  size={17}
                  strokeWidth={2.4}
                  className={`sidebar-chevron ${isGroupOpen ? "rotated" : ""}`}
                />
              </button>

              {/* Submenu in Expanded mode */}
              {open && isGroupOpen && (
                <div className="sidebar-submenu">
                  {item.links.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      className="sidebar-subitem"
                    >
                      <Diamond size={10} strokeWidth={2.4} className="sidebar-subitem-dot" />
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
          className="sidebar-flyout sidebar-fixed-flyout"
          style={{ top: `${flyout.top}px` }}
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          {flyout.item.type === "link" ? (
            <NavLink
              to={flyout.item.to}
              className="sidebar-flyout-link active"
              onClick={() => setFlyout(null)}
            >
              <span>{flyout.item.label}</span>
            </NavLink>
          ) : (
            <>
              <div className="sidebar-flyout-header">{flyout.item.label}</div>
              <div className="sidebar-flyout-links">
                {flyout.item.links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `sidebar-flyout-link ${isActive ? "active" : ""}`
                    }
                    onClick={() => setFlyout(null)}
                  >
                    <Diamond size={8} className="sidebar-flyout-dot" />
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