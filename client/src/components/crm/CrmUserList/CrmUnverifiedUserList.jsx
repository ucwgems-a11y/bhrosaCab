import { useState, useEffect } from "react";
import { Search, RefreshCw, Eye, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import Pagination from "../../admin/rides/Pagination/Pagination";
import "./CrmUserList.css";

export default function CrmUnverifiedUserList() {
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
    navigate(`/crm-user/${id}`);
  }

  return (
    <div className="crm-userlist-page-wrap">
      {/* Back Button */}
      <div style={{ marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => navigate("/crm-user")}
          className="crm-userlist-reload-btn"
          style={{
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to All Users</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="crm-userlist-card">
        <div className="crm-userlist-card-header">
          <User size={18} />
          <span>Unverified Users ({users.length})</span>
        </div>

        <div className="crm-userlist-card-body">
          {/* Toolbar */}
          <div className="crm-userlist-toolbar">
            <form className="crm-userlist-search-form" onSubmit={handleSearch}>
              <Search size={16} className="crm-userlist-search-icon" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            <button
              type="button"
              className="crm-userlist-reload-btn"
              onClick={handleReload}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
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
                      Loading unverified users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="crm-userlist-no-data">
                      No unverified users found
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
