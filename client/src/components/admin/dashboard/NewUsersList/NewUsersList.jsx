import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../api/axios";
import "./NewUsersList.css";

export default function NewUsersList({ initialUsers = [] }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(!initialUsers || initialUsers.length === 0);

  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setUsers(initialUsers);
      setLoading(false);
      return;
    }

    async function fetchNewUsers() {
      setLoading(true);
      try {
        const res = await api.get("/users?limit=8");
        if (res.data && res.data.users) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch new users for dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNewUsers();
  }, [initialUsers]);

  function handleViewAll() {
    navigate("/admin/users/list");
  }

  function handleUserClick(id) {
    navigate(`/admin/users/${id}`);
  }

  return (
    <div className="new-users-card">
      <div className="new-users-header">
        <h3>New Users [{users.length}]</h3>
        <button className="new-users-all-btn" onClick={handleViewAll} type="button">
          All Users
        </button>
      </div>

      <div className="new-users-grid">
        {loading ? (
          <div style={{ color: "var(--text-muted)", gridColumn: "1 / -1", padding: "10px 0" }}>
            Loading recent users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ color: "var(--text-muted)", gridColumn: "1 / -1", padding: "10px 0" }}>
            No recent users found
          </div>
        ) : (
          users.map((user) => {
            const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user.name || "User"
            )}&background=random`;
            return (
              <div
                className="new-user-item"
                key={user.id || user._id}
                onClick={() => handleUserClick(user.id || user._id)}
                style={{ cursor: "pointer" }}
                title={`View ${user.name}`}
              >
                <img
                  className="new-user-avatar"
                  src={user.image || defaultAvatar}
                  alt={user.name}
                  onError={(e) => {
                    e.target.src = defaultAvatar;
                  }}
                />
                <span className="new-user-name">{user.name}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
