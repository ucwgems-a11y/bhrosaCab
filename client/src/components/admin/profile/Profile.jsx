import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";
import { showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import "./Profile.css";

import coverImg from "../../../assets/img/taxi.jpg";

export default function Profile() {
  const { admin, updateAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("about");

  const [form, setForm] = useState({
    name: admin?.name || "",
    nickName: admin?.nickName || "",
    email: admin?.email || "",
    country: admin?.country || "",
    gender: admin?.gender || "",
    phone: admin?.phone || "",
    dob: admin?.dob ? admin.dob.substring(0, 10) : "",
    featured: admin?.featured || false,
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadFreshProfile() {
      try {
        const res = await api.get("/auth/profile");
        if (res.data && res.data.admin) {
          const fresh = res.data.admin;
          updateAdmin(fresh);
          setForm({
            name: fresh.name || "",
            nickName: fresh.nickName || "",
            email: fresh.email || "",
            country: fresh.country || "",
            gender: fresh.gender || "",
            phone: fresh.phone || "",
            dob: fresh.dob ? fresh.dob.substring(0, 10) : "",
            featured: fresh.featured || false,
          });
        }
      } catch (err) {
        console.warn("Could not load fresh profile:", err.message);
      }
    }
    loadFreshProfile();
  }, []);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) return avatarPath;
    const clean = avatarPath.startsWith("/") ? avatarPath : `/${avatarPath}`;
    return `${SERVER_URL}${clean}`;
  };

  async function handleSettingsSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          data.append(key, value);
        }
      });
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const res = await api.put("/auth/profile", data);
      if (res.data && res.data.admin) {
        updateAdmin(res.data.admin);
        setForm({
          name: res.data.admin.name || "",
          nickName: res.data.admin.nickName || "",
          email: res.data.admin.email || "",
          country: res.data.admin.country || "",
          gender: res.data.admin.gender || "",
          phone: res.data.admin.phone || "",
          dob: res.data.admin.dob ? res.data.admin.dob.substring(0, 10) : "",
          featured: res.data.admin.featured || false,
        });
      }
      setAvatarFile(null);
      setSaved(true);
      showSuccessAlert("Your profile has been saved successfully!", 1200);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Failed to update profile:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-title-bar">
        <span>Profile</span>
      </div>

      <div className="profile-cover">
        <img src={coverImg} alt="" />
        <div className="profile-cover-info">
          <div className="profile-avatar">
            {admin?.avatar ? (
              <img
                src={getAvatarUrl(admin.avatar)}
                alt=""
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              admin?.nickName?.[0] || admin?.name?.[0] || "A"
            )}
          </div>
          <div className="profile-cover-text">
            <div className="profile-cover-field">
              <span className="profile-cover-value">{admin?.nickName || admin?.name}</span>
              <span className="profile-cover-label">Name</span>
            </div>
            <div className="profile-cover-field">
              <span className="profile-cover-value">{admin?.email}</span>
              <span className="profile-cover-label">Email</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={activeTab === "about" ? "active" : ""}
          onClick={() => setActiveTab("about")}
        >
          About Me
        </button>
        <button
          className={activeTab === "settings" ? "active" : ""}
          onClick={() => setActiveTab("settings")}
        >
          Settings
        </button>
      </div>

      {activeTab === "about" && (
        <div className="profile-tab-content">
          <h3>About Me</h3>
          <p className="profile-bio-text">
            A wonderful serenity has taken possession of my entire soul, like these
            sweet mornings of spring which I enjoy with my whole heart. I am alone,
            and feel the charm of existence was created for the bliss of souls like
            mine. I am so happy, my dear friend, so absorbed in the exquisite sense
            of mere tranquil existence, that I neglect my talents.
          </p>
          <p className="profile-bio-text">
            A collection of textile samples lay spread out on the table - Samsa
            was a travelling salesman - and above it there hung a picture that he
            had recently cut out of an illustrated magazine and housed in a nice,
            gilded frame.
          </p>

          {/* <h3>Language</h3>
          <div className="profile-language-tags">
            <span>English</span>
            <span>French</span>
            <span>Bangla</span>
          </div> */}

          <h3>Personal Information</h3>
          <div className="profile-info-grid">
            <div className="profile-info-row">
              <span className="profile-info-label">Name :</span>
              <span className="profile-info-value">{admin?.name}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Email :</span>
              <span className="profile-info-value">{admin?.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Nick Name :</span>
              <span className="profile-info-value">{admin?.nickName || "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Phone :</span>
              <span className="profile-info-value">{admin?.phone || "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Date Of Birth :</span>
              <span className="profile-info-value">
                {admin?.dob ? new Date(admin.dob).toLocaleDateString() : "—"}
              </span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Country :</span>
              <span className="profile-info-value">{admin?.country || "—"}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">Gender :</span>
              <span className="profile-info-value">{admin?.gender || "—"}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <form className="profile-tab-content profile-settings-form" onSubmit={handleSettingsSubmit}>
          <div className="profile-form-grid">
            <div className="profile-form-field">
              <label>Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="profile-form-field">
              <label>Nick Name</label>
              <input
                value={form.nickName}
                onChange={(e) => setForm({ ...form, nickName: e.target.value })}
              />
            </div>

            <div className="profile-form-field profile-form-field-full">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="profile-form-field profile-form-field-full">
              <label>Country</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>

            <div className="profile-form-field profile-form-field-full">
              <label>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="profile-form-field profile-form-field-full">
              <label>Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>

            <div className="profile-form-field profile-form-field-full">
              <label>Date of Birth</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </div>

            <div className="profile-form-field profile-form-field-full">
              <label>Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
              {(avatarFile || admin?.avatar) && (
                <img
                  src={
                    avatarFile
                      ? URL.createObjectURL(avatarFile)
                      : getAvatarUrl(admin.avatar)
                  }
                  alt=""
                  className="profile-form-avatar-preview"
                />
              )}
            </div>

            <div className="profile-form-field profile-form-field-full profile-form-checkbox-row">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              <label htmlFor="featured">Check me out</label>
            </div>
          </div>

          <button type="submit" className="profile-update-btn" disabled={saving}>
            {saving ? "Updating..." : saved ? "Updated ✓" : "Update"}
          </button>
        </form>
      )}
    </div>
  );
}