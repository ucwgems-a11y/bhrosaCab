import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, User, ArrowLeft } from "lucide-react";
import api from "../../../api/axios";
import { swalWithBootstrapButtons } from "../../../utils/sweetAlert";
import "./CrmUserDetail.css";

export default function CrmUserDetail() {
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
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchUser();
    }
  }, [id]);

  function handleLiveLocation() {
    navigate(`/crm-user/${id}/location`);
  }

  function handleBackToList() {
    navigate("/crm-user");
  }

  if (loading) {
    return (
      <div className="crm-userdetail-page-wrap" style={{ color: "var(--text-primary, #fff)", padding: "40px", textAlign: "center" }}>
        Loading user details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="crm-userdetail-page-wrap" style={{ color: "var(--text-primary, #fff)", padding: "40px", textAlign: "center" }}>
        <h3>User not found</h3>
        <button className="crm-userdetail-back-top-btn" onClick={handleBackToList} style={{ marginTop: "16px" }}>
          Back
        </button>
      </div>
    );
  }

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&size=400`;
  const isVerified = (user.aadhaarStatus || "").toLowerCase() === "verified";

  return (
    <div className="crm-userdetail-page-wrap">
      <div style={{ marginBottom: "16px" }}>
        <button
          type="button"
          className="crm-userdetail-back-top-btn"
          onClick={handleBackToList}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      <div className="crm-userdetail-grid">
        {/* Left: Profile Card */}
        <div className="crm-userdetail-profile-card">
          <div className="crm-userdetail-banner">
            <img
              src={user.image || defaultAvatar}
              alt={user.name}
              onError={(e) => {
                e.target.src = defaultAvatar;
              }}
            />
          </div>
          <div className="crm-userdetail-header">
            <div className="crm-userdetail-name">{user.name}</div>
            <div className="crm-userdetail-email">{user.email}</div>
          </div>
        </div>

        {/* Right: Info Cards */}
        <div className="crm-userdetail-right-col">
          {/* User Information */}
          <div className="crm-userdetail-info-card">
            <div className="crm-userdetail-actions-row">
              <button
                type="button"
                className="crm-userdetail-btn location"
                onClick={handleLiveLocation}
              >
                <MapPin size={15} /> User Live Location
              </button>
              <button
                type="button"
                className="crm-userdetail-btn back"
                onClick={handleBackToList}
              >
                <User size={15} /> Back To User List
              </button>
            </div>

            <div className="crm-userdetail-section-title">User Information</div>

            <div className="crm-userdetail-info-grid">
              <div className="crm-userdetail-info-item">
                <div className="crm-userdetail-info-label">Date of Birth</div>
                <div className="crm-userdetail-info-value">{user.dob}</div>
              </div>

              <div className="crm-userdetail-info-item">
                <div className="crm-userdetail-info-label">Gender</div>
                <div className="crm-userdetail-info-value">
                  <span className="crm-gender-text">{user.gender}</span>
                </div>
              </div>

              <div className="crm-userdetail-info-item">
                <div className="crm-userdetail-info-label">Country</div>
                <div className="crm-userdetail-info-value">{user.country}</div>
              </div>
            </div>
          </div>

          {/* Aadhaar Details */}
          <div className="crm-userdetail-info-card">
            <div className="crm-userdetail-section-title">Aadhaar Details</div>

            <div className="crm-userdetail-info-grid">
              <div className="crm-userdetail-info-item">
                <div className="crm-userdetail-info-label">Aadhaar Number</div>
                <div className="crm-userdetail-info-value">{user.aadhaarNumber || "Not Provided"}</div>
              </div>

              <div className="crm-userdetail-info-item">
                <div className="crm-userdetail-info-label">Status</div>
                <div className="crm-userdetail-info-value">
                  <span className={`crm-badge-status ${isVerified ? "verified" : "unverified"}`}>
                    {user.aadhaarStatus || "None"}
                  </span>
                </div>
              </div>

              <div className="crm-userdetail-info-item">
                <div className="crm-userdetail-info-label">Aadhaar Front</div>
                {user.aadhaarFront ? (
                  <img
                    src={user.aadhaarFront}
                    alt="Aadhaar Front"
                    className="crm-userdetail-doc-thumb"
                    style={{
                      width: "120px",
                      height: "75px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid var(--crm-border, #333)",
                      display: "block",
                      marginTop: "6px",
                    }}
                  />
                ) : (
                  <div className="crm-userdetail-info-value muted">Not uploaded</div>
                )}
              </div>

              <div className="crm-userdetail-info-item">
                <div className="crm-userdetail-info-label">Aadhaar Back</div>
                {user.aadhaarBack ? (
                  <img
                    src={user.aadhaarBack}
                    alt="Aadhaar Back"
                    className="crm-userdetail-doc-thumb"
                    style={{
                      width: "120px",
                      height: "75px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid var(--crm-border, #333)",
                      display: "block",
                      marginTop: "6px",
                    }}
                  />
                ) : (
                  <div className="crm-userdetail-info-value muted">Not uploaded</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
