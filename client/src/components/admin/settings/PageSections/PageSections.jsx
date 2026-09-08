import { useParams, useNavigate } from "react-router-dom";
import {
  Info,
  Tag,
  Download,
  Sparkles,
  CalendarCheck,
  ClipboardList,
  Star,
  FileText,
  ArrowLeft,
} from "lucide-react";
import "./PageSections.css";

const pageSectionsMap = {
  home: {
    title: "Home Page",
    sections: [
      { key: "hero", label: "Hero", icon: Sparkles },
      { key: "about", label: "About", icon: Info },
      { key: "cab-offer", label: "Cab Offer", icon: Tag },
      { key: "download-section", label: "Download Section", icon: Download },
      { key: "online-booking", label: "Online Booking", icon: CalendarCheck },
      { key: "registration-section", label: "Registration Section", icon: ClipboardList },
      { key: "why-choose", label: "Why Choose", icon: Star },
    ],
  },
  about: {
    title: "About Page",
    sections: [
      { key: "banner", label: "Banner", icon: Sparkles },
      { key: "company", label: "About Company", icon: Info },
      { key: "cta", label: "CTA Section", icon: ClipboardList },
    ],
  },
 services: {
  title: "Services Page",
  sections: [
    { key: "banner", label: "Banner", icon: Sparkles },
    { key: "cards", label: "Services Cards", icon: Tag },
    { key: "pricing", label: "Pricing", icon: FileText },
    { key: "cta", label: "Taxi CTA", icon: ClipboardList },
  ],
},

 event: {
  title: "Event Page",
  sections: [{ key: "guests", label: "Event Guests", icon: Star }],
},
 franchise: {
  title: "Franchise Page",
  sections: [
    { key: "banner", label: "Banner", icon: Sparkles },
    { key: "benefits", label: "Benefits", icon: Star },
    { key: "form", label: "Application Form", icon: ClipboardList },
  ],
},
contact: {
  title: "Contact Page",
  sections: [
    { key: "map", label: "Map", icon: FileText },
    { key: "info", label: "Contact Info", icon: Info },
    { key: "messages", label: "Messages", icon: CalendarCheck },
  ],
},
footer: {
  title: "Site Footer",
  sections: [
    { key: "top", label: "Top Section", icon: Sparkles },
    { key: "middle", label: "Middle Section", icon: Info },
    { key: "vehicles", label: "Running Vehicles", icon: Star },
  ],
},
};

export default function PageSections() {
  const { pageKey } = useParams();
  const navigate = useNavigate();
  const page = pageSectionsMap[pageKey];

  if (!page) {
    return <p className="page-sections-missing">This page was not found in the configuration.</p>;
  }

  return (
    <div>
      <button className="page-sections-back" onClick={() => navigate("/admin/settings/website")}>
        <ArrowLeft size={16} /> Back
      </button>

      <h1 className="page-sections-title">{page.title}</h1>
      <p className="page-sections-sub">Select a section to edit its content</p>

      <div className="page-sections-grid">
        {page.sections.map((section) => (
          <button
            key={section.key}
            className="page-section-card"
            onClick={() => navigate(`/admin/settings/website/${pageKey}/${section.key}`)}
          >
            <div className="page-section-icon">
              <section.icon size={20} />
            </div>
            <div className="page-section-label">{section.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}