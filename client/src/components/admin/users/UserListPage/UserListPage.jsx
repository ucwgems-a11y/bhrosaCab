import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Users,
  Eye,
  Power,
  Calendar,
  CheckCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import api from "../../../../api/axios";
import { swalWithBootstrapButtons } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import "./UserListPage.css";

export default function UserListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    verifiedUsers: 0,
    unverifiedUsers: 0,
    todayVerified: 0,
    todayUnverified: 0,
  });

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, color: "#e8873a", icon: <Users size={16} /> },
    { label: "Today Users", value: stats.todayUsers, color: "#2e9e5b", icon: <Calendar size={16} /> },
    { label: "Verified", value: stats.verifiedUsers, color: "#8b5cf6", icon: <CheckCircle size={16} /> },
    { label: "Unverified", value: stats.unverifiedUsers, color: "#e8873a", icon: <AlertTriangle size={16} /> },
    { label: "Today Verified", value: stats.todayVerified, color: "#2e9e5b", icon: <CheckCircle size={16} /> },
    { label: "Today Unverified", value: stats.todayUnverified, color: "#e5484d", icon: <AlertTriangle size={16} /> },
  ];

  async function fetchStats() {
    try {
      const res = await api.get("/users/stats");
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  }

  async function fetchUsers(page = 1, query = "") {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&limit=10&search=${encodeURIComponent(query)}`);
      if (res.data) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  }

  useEffect(() => {
    fetchStats();
    fetchUsers(currentPage, search);
  }, [currentPage]);

  function handleSearch(e) {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, search);
  }

  async function handleReload() {
    setLoading(true);
    setSearch("");
    setCurrentPage(1);
    try {
      await Promise.all([
        fetchStats(),
        api.get("/users?page=1&limit=10&search=").then((res) => {
          if (res.data) {
            setUsers(res.data.users || []);
            setTotalPages(res.data.totalPages || 1);
          }
        }),
      ]);
    } catch (err) {
      console.error("Failed to reload users:", err);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  }

  function handleView(id) {
    navigate(`/admin/users/${id}`);
  }

  function handleBlockToggle(id) {
    swalWithBootstrapButtons.fire({
      title: "Change Block Status?",
      text: "Are you sure you want to change this user's account access status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change status",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.patch(`/users/${id}/toggle-block`);
          setUsers((prev) =>
            prev.map((u) => (u.id === id ? { ...u, blocked: res.data.blocked } : u))
          );
          swalWithBootstrapButtons.fire({
            title: "Status Updated!",
            text: res.data.message || "User block status has been updated.",
            icon: "success",
          });
        } catch (err) {
          swalWithBootstrapButtons.fire({
            title: "Error",
            text: "Failed to update block status.",
            icon: "error",
          });
        }
      }
    });
  }

  function handleLogout(id) {
    swalWithBootstrapButtons.fire({
      title: "Logout User?",
      text: "Are you sure you want to force logout this user from all sessions?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout user",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.post(`/users/${id}/logout`);
          swalWithBootstrapButtons.fire({
            title: "Logged Out!",
            text: res.data?.message || "User has been logged out successfully.",
            icon: "success",
          });
          fetchUsers(currentPage, search);
        } catch (err) {
          swalWithBootstrapButtons.fire({
            title: "Error",
            text: err.response?.data?.message || "Failed to logout user.",
            icon: "error",
          });
        }
      }
    });
  }

  function handleUnverifiedClick() {
    navigate("/admin/users/unverified");
  }

  return (
    <div className="userlist-page-wrap">
      {/* Stat cards */}
      <div className="user-stats-row">
        {statCards.map((stat) =>
          stat.label === "Unverified" ? (
            <button
              key={stat.label}
              className="user-stat-card user-stat-card-clickable"
              onClick={handleUnverifiedClick}
            >
              <span className="user-stat-label">{stat.label}</span>
              <h4 className="user-stat-value">{stat.value}</h4>
              <div className="user-stat-icon" style={{ background: stat.color }}>
                {stat.icon}
              </div>
            </button>
          ) : (
            <div key={stat.label} className="user-stat-card">
              <span className="user-stat-label">{stat.label}</span>
              <h4 className="user-stat-value">{stat.value}</h4>
              <div className="user-stat-icon" style={{ background: stat.color }}>
                {stat.icon}
              </div>
            </div>
          )
        )}
      </div>

      {/* Manage Users card */}
      <div className="userlist-card">
        <div className="userlist-card-header">
          <User size={18} />
          <span>Manage Users</span>
        </div>

        <div className="userlist-card-body">
          <div className="userlist-toolbar">
            <form className="userlist-search-form" onSubmit={handleSearch}>
              <Search size={16} className="userlist-search-icon" />
              <input
                type="text"
                placeholder="Search users by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <button
              type="button"
              className="userlist-reload-btn"
              onClick={handleReload}
              title="Reload Users"
            >
              <RefreshCw size={14} className={loading ? "spin-fast" : ""} />
              <span>Reload</span>
            </button>
          </div>

          <div className="userlist-table-wrap">
            <table className="userlist-table">
              <thead>
                <tr>
                  <th>Sr.no</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Account Create Date</th>
                  <th>Action</th>        
                </tr>
              </thead>
              <tbody>
                {loading && users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="userlist-no-data" style={{ padding: "35px", textAlign: "center" }}>
                      <RefreshCw size={18} className="spin-fast" style={{ display: "inline-block", marginRight: "8px", verticalAlign: "middle" }} />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="userlist-no-data">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{i + 1}</td>
                      <td>
                        <div className="userlist-person-cell">
                          <img
                            src={u.image}
                            alt=""
                            className="userlist-avatar"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=random`;
                            }}
                          />
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{u.dob}</td>
                      <td>{u.gender}</td>
                      <td>{u.createdDate}</td>
                      <td>
                        <div className="userlist-action-row">
                          <button
                            className="userlist-btn view"
                            onClick={() => handleView(u.id)}
                          >
                            <Eye size={13} /> View
                          </button>
                          <button
                            className="userlist-btn unblock"
                            onClick={() => handleBlockToggle(u.id)}
                          >
                            {u.blocked ? "Block" : "Unblock"}
                          </button>
                          <button
                            className="userlist-icon-btn logout"
                            title="Logout"
                            onClick={() => handleLogout(u.id)}
                          >
                            <Power size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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


