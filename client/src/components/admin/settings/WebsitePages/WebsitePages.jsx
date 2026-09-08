import { useNavigate } from "react-router-dom";
import { Phone as PhoneIcon, Home, Info, Wrench, Phone, CalendarDays, Building2, LayoutTemplate } from "lucide-react"
import "./WebsitePages.css";

// Header pehle rakha hai kyunki ye website ke har page pe common hota hai
const pages = [
  { key: "company-info", label: "Company Info", icon: <PhoneIcon size={20} /> },
  { key: "header", label: "Header", icon: <LayoutTemplate size={20} /> },
  { key: "home", label: "Home", icon: <Home size={20} /> },
  { key: "about", label: "About Us", icon: <Info size={20} /> },
  { key: "services", label: "Services", icon: <Wrench size={20} /> },
  { key: "contact", label: "Contact", icon: <Phone size={20} /> },
  { key: "event", label: "Event", icon: <CalendarDays size={20} /> },
  { key: "franchise", label: "Franchise", icon: <Building2 size={20} /> },
  { key: "footer", label: "Footer", icon: <LayoutTemplate size={20} /> },
];

export default function WebsitePages() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="website-pages-title">Bhrosa Cab Website</h1>
      <p className="website-pages-sub">Select a page to edit its content</p>

      <div className="website-pages-grid">
        {pages.map((page) => (
          <button
            key={page.key}
            className="website-page-card"
            onClick={() => navigate(`/admin/settings/website/${page.key}`)}
          >
            <div className="website-page-icon">{page.icon}</div>
            <div className="website-page-label">{page.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}