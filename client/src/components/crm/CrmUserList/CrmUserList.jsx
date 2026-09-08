import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Users,
  Eye,
  Calendar,
  CheckCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import api from "../../../api/axios";
import Pagination from "../../admin/rides/Pagination/Pagination";
import "./CrmUserList.css";

export default function CrmUserList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    todayVerified: 0,
    todayUnverified: 0,
  });

  async function fetchStats() {
    try {
      const res = await api.get("/users/stats");
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch CRM user stats:", err);
    }
  }

  async function fetchUsers(page = currentPage, query = search, status = filterStatus) {
    setLoading(true);
    try {
      let url = `/users?page=${page}&limit=10&search=${encodeURIComponent(query)}`;
      if (status !== "all") {
        url += `&status=${status}`;
      }
      const res = await api.get(url);
      if (res.data) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch CRM users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, search, filterStatus);
  }, [currentPage, filterStatus]);

  function handleSearch(e) {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, search, filterStatus);
  }

  async function handleReload() {
    setLoading(true);
    setSearch("");
    setFilterStatus("all");
    setCurrentPage(1);
    try {
      await Promise.all([
        fetchStats(),
        fetchUsers(1, "", "all")
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  }

  function handleView(id) {
    navigate(`/crm-user/${id}`);
  }

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toString(),
      color: "#e8873a",
      icon: <Users size={16} />,
      clickable: true,
      onClick: () => {
        setFilterStatus("all");
        setCurrentPage(1);
      },
    },
    {
      label: "Today Users",
      value: stats.todayUsers.toString(),
      color: "#2e9e5b",
      icon: <Calendar size={16} />,
      clickable: false,
    },
    {
      label: "Verified",
      value: stats.verifiedUsers.toString(),
      color: "#8b5cf6",
      icon: <CheckCircle size={16} />,
      clickable: true,
      onClick: () => {
        setFilterStatus("verified");
        setCurrentPage(1);
      },
    },
    {
      label: "Unverified",
      value: stats.unverifiedUsers.toString(),
      color: "#e8873a",
      icon: <AlertTriangle size={16} />,
      clickable: true,
      onClick: () => navigate("/crm-user-unverified"),
    },
    {
      label: "Today Verified",
      value: stats.todayVerified.toString(),
      color: "#2e9e5b",
      icon: <CheckCircle size={16} />,
      clickable: false,
    },
    {
      label: "Today Unverified",
      value: stats.todayUnverified.toString(),
      color: "#e5484d",
      icon: <AlertTriangle size={16} />,
      clickable: false,
    },
  ];

  return (
    <div className="crm-userlist-page-wrap">
      {/* Stat cards row */}
      <div className="crm-user-stats-row">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`crm-user-stat-card ${card.clickable ? "crm-user-stat-card-clickable" : ""}`}
            onClick={card.onClick}
          >
            <span className="crm-user-stat-label">{card.label}</span>
            <div className="crm-user-stat-value">{card.value}</div>
            <div
              className="crm-user-stat-icon"
              style={{ backgroundColor: card.color }}
            >
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Manage Users card */}
      <div className="crm-userlist-card">
        <div className="crm-userlist-card-header">
          <User size={18} />
          <span>Manage Users</span>
        </div>

        <div className="crm-userlist-card-body">
          {/* Toolbar */}
          <div className="crm-userlist-toolbar">
            <form className="crm-userlist-search-form" onSubmit={handleSearch}>
              <Search size={16} className="crm-userlist-search-icon" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <button
              type="button"
              className="crm-userlist-reload-btn"
              onClick={handleReload}
              title="Reload Users"
            >
              <RefreshCw size={14} className={loading ? "spin-fast" : ""} />
              <span>Reload</span>
            </button>
          </div>

          {/* Table */}
          <div className="crm-userlist-table-wrap">
            <table className="crm-userlist-table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>#</th>
                  <th>User</th>
                  <th>Email</th>
                  <th style={{ textAlign: "center" }}>DOB</th>
                  <th style={{ textAlign: "center" }}>Gender</th>
                  <th style={{ textAlign: "center" }}>Account Create Date</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="crm-userlist-no-data">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="crm-userlist-no-data">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id}>
                      <td className="crm-td-sr" style={{ textAlign: "center" }}>
                        {(currentPage - 1) * 10 + i + 1}
                      </td>
                      <td>
                        <div className="crm-userlist-person-cell">
                          <img
                            src={u.image}
                            alt=""
                            className="crm-userlist-avatar"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=random`;
                            }}
                          />
                          <span className="crm-userlist-person-name">{u.name}</span>
                        </div>
                      </td>
                      <td className="crm-td-email">{u.email}</td>
                      <td style={{ textAlign: "center" }}>{u.dob}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className="crm-gender-text">{u.gender}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>{u.createdDate}</td>
                      <td>
                        <div className="crm-action-cell-wrap">
                          <button
                            type="button"
                            className="crm-pill-btn crm-btn-view"
                            onClick={() => handleView(u.id)}
                          >
                            <Eye size={13} strokeWidth={2.5} />
                            <span>View</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
