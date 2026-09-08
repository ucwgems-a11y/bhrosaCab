import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, User, ArrowLeft } from "lucide-react";
import api from "../../../../api/axios";
import "./UserDetailPage.css";

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        if (res.data && res.data.user) {
          setUser(res.data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchUser();
    }
  }, [id]);

  function handleLiveLocation() {
    navigate(`/admin/users/${id}/location`);
  }

  function handleBackToList() {
    navigate("/admin/users/list");
  }

  if (loading) {
    return (
      <div className="userdetail-page-wrap" style={{ color: "var(--text-primary, #fff)", padding: "40px", textAlign: "center" }}>
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="userdetail-page-wrap" style={{ color: "var(--text-primary, #fff)", padding: "40px", textAlign: "center" }}>
        <h3>User not found</h3>
        <button
          className="fc-back-btn"
          onClick={handleBackToList}
          style={{
            marginTop: "16px",
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
          }}
        >
          <ArrowLeft size={16} /> Back to Users List
        </button>
      </div>
    );
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&size=400`;

  return (
    <div className="userdetail-page-wrap">
      <div style={{ marginBottom: "16px" }}>
        <button
          className="fc-back-btn"
          onClick={handleBackToList}
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

      <div className="userdetail-grid">
        {/* Left: profile card */}
        <div className="userdetail-profile-card">
          <div className="userdetail-banner">
            <img
              src={user.image || defaultAvatar}
              alt={user.name}
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
          </div>
          <div className="userdetail-header">
            <div className="userdetail-name">{user.name}</div>
            <div className="userdetail-email">{user.email}</div>
          </div>
        </div>

        {/* Right: info cards */}
        <div className="userdetail-right-col">
          {/* User Information */}
          <div className="userdetail-info-card">
            <div className="userdetail-actions-row">
              <button className="userdetail-btn location" onClick={handleLiveLocation}>
                <MapPin size={14} /> User Live Location
              </button>
              <button className="userdetail-btn back" onClick={handleBackToList}>
                <User size={14} /> Back To User List
              </button>
            </div>

            <div className="userdetail-section-title">User Information</div>

            <div className="userdetail-info-grid">
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Phone</div>
                <div className="userdetail-info-value">{user.phone}</div>
              </div>
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Date of Birth</div>
                <div className="userdetail-info-value">{user.dob}</div>
              </div>
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Gender</div>
                <div className="userdetail-info-value">{user.gender}</div>
              </div>
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Country</div>
                <div className="userdetail-info-value">{user.country}</div>
              </div>
            </div>
          </div>

          {/* Aadhaar Details */}
          <div className="userdetail-info-card">
            <div className="userdetail-section-title">Aadhaar Details</div>

            <div className="userdetail-info-grid">
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Aadhaar Number</div>
                <div className="userdetail-info-value">{user.aadhaarNumber || "Not Provided"}</div>
              </div>
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Status</div>
                <span className={`userdetail-badge ${(user.aadhaarStatus || "none").toLowerCase()}`}>
                  {user.aadhaarStatus || "None"}
                </span>
              </div>
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Aadhaar Front</div>
                {user.aadhaarFront ? (
                  <img
                    src={user.aadhaarFront}
                    alt="Aadhaar Front"
                    className="userdetail-doc-thumb"
                    style={{ width: "120px", height: "75px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color, #333)", display: "block", marginTop: "6px" }}
                  />
                ) : (
                  <div className="userdetail-muted">Not uploaded</div>
                )}
              </div>
              <div className="userdetail-info-item">
                <div className="userdetail-info-label">Aadhaar Back</div>
                {user.aadhaarBack ? (
                  <img
                    src={user.aadhaarBack}
                    alt="Aadhaar Back"
                    className="userdetail-doc-thumb"
                    style={{ width: "120px", height: "75px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border-color, #333)", display: "block", marginTop: "6px" }}
                  />
                ) : (
                  <div className="userdetail-muted">Not uploaded</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
