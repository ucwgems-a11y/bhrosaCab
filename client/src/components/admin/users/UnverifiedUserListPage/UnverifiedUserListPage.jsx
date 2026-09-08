import { useState, useEffect } from "react";
import { Search, RefreshCw, Eye, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import Pagination from "../../rides/Pagination/Pagination";
import "../UserListPage/UserListPage.css";

export default function UnverifiedUserListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchUnverified(page = currentPage, query = search) {
    setLoading(true);
    try {
      const res = await api.get(`/users?status=unverified&page=${page}&limit=10&search=${encodeURIComponent(query)}`);
      if (res.data) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch unverified users:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUnverified(currentPage, search);
  }, [currentPage]);

  function handleSearch(e) {
    e.preventDefault();
    setCurrentPage(1);
    fetchUnverified(1, search);
  }

  function handleReload() {
    setSearch("");
    setCurrentPage(1);
    fetchUnverified(1, "");
  }

  function handleView(id) {
    navigate(`/admin/users/${id}`);
  }

  return (
    <div className="userlist-page-wrap">
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/users/list")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--card-bg, #1a222d)",
            color: "var(--text-main, #fff)",
            border: "1px solid var(--border-color, #2a3441)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Users List</span>
        </button>
      </div>

      <div className="userlist-card">
        <div className="userlist-card-header">
          <User size={18} />
          <span>Unverified Users ({users.length})</span>
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

            <button className="userlist-reload-btn" onClick={handleReload} disabled={loading}>
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Reload
            </button>
          </div>

          <div className="userlist-table-wrap">
            <table className="userlist-table">
              <thead>
                <tr>
                  <th>#</th>
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="userlist-no-data">
                      Loading unverified users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="userlist-no-data">
                      No unverified users found
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u.id}>
                      <td>{(currentPage - 1) * 10 + i + 1}</td>
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
                        <button
                          className="userlist-btn view"
                          onClick={() => handleView(u.id)}
                        >
                          <Eye size={13} /> View
                        </button>
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
