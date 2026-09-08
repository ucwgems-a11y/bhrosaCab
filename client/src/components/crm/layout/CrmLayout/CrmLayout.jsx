import { useState } from "react";
import { Outlet } from "react-router-dom";
import CrmSidebar from "../CrmSidebar/CrmSidebar";
import CrmTopbar from "../CrmTopbar/CrmTopbar";
import "./CrmLayout.css";

export default function CrmLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("crmSidebarOpen");
    return saved !== null ? saved === "true" : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("crmSidebarOpen", String(next));
      return next;
    });
  };

  return (
    <div className="crm-shell">
      <CrmSidebar open={sidebarOpen} />
      <div className="crm-shell-main">
        <CrmTopbar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="crm-shell-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
