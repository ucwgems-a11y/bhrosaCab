import { Link } from "react-router-dom";
import "./CrmNewUsersList.css";

export default function CrmNewUsersList({ users = [], loading = false }) {
  return (
    <div className="crm-new-users-card">
      <div className="crm-new-users-header">
        <h4 className="crm-new-users-title">New Users [{users.length}]</h4>
        <Link to="/crm-user" className="crm-all-users-btn">
          All Users
        </Link>
      </div>

      <div className="crm-new-users-body">
        {loading ? (
          <div style={{ color: "var(--text-muted)", padding: "16px" }}>
            Loading recent users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ color: "var(--text-muted)", padding: "16px" }}>
            No recent users found
          </div>
        ) : (
          <div className="crm-new-users-grid">
            {users.map((u) => {
              const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                u.name || "User"
              )}&background=random`;
              return (
                <Link
                  to={`/crm-user/${u.id || u._id}`}
                  key={u.id || u._id}
                  className="crm-new-user-item"
                  style={{ textDecoration: "none" }}
                  title={`View ${u.name}`}
                >
                  <div className="crm-new-user-avatar-wrap">
                    <img
                      src={u.image || defaultAvatar}
                      alt={u.name}
                      className="crm-new-user-avatar"
                      onError={(e) => {
                        e.target.src = defaultAvatar;
                      }}
                    />
                  </div>
                  <span className="crm-new-user-name">{u.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
