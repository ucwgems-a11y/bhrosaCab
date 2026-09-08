import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import DashboardFooter from "../../dashboard/DashboardFooter/DashboardFooter";
import "./AdminLayout.css";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? saved === "true" : true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebarOpen", String(next));
      return next;
    });
  };

  return (
    <div className="admin-shell">
      <Sidebar open={sidebarOpen} />
      <div className="admin-shell-main">
        <Topbar onToggleSidebar={toggleSidebar} isSidebarOpen={sidebarOpen} />
        <div className="admin-shell-content">
          <Outlet />
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}