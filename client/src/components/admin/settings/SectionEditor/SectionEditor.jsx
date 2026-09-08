import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import homeEditors from "../home/editors";
import aboutEditors from "../about/editors";
import servicesEditors from "../services/editors";
import contactEditors from "../contact/editors";
import eventEditors from "../event/editors";
import franchiseEditors from "../franchise/editors";
import footerEditors from "../footer/editors";

const pageEditorsMap = {
  home: homeEditors,
  about: aboutEditors,
  services: servicesEditors,
  contact: contactEditors,
    event: eventEditors,
    franchise: franchiseEditors,
      footer: footerEditors,
};

export default function SectionEditor() {
  const { pageKey, sectionKey } = useParams();
  const navigate = useNavigate();

  const Editor = pageEditorsMap[pageKey]?.[sectionKey];

  return (
    <div>
      <button
        onClick={() => navigate(`/admin/settings/website/${pageKey}`)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "none",
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      {Editor ? (
        <Editor />
      ) : (
        <p style={{ color: "var(--text-muted)" }}>This section hasn't been built yet.</p>
      )}
    </div>
  );
}