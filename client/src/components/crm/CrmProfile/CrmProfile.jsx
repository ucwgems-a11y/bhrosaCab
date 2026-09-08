import { useState, useRef, useEffect } from "react";
import {
  Mail,
  MapPin,
  User,
  Globe,
  Building,
  Map,
  FileText,
  XCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  UserPlus,
  Camera,
} from "lucide-react";
import axios from "axios";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import { showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import { SERVER_URL, API_BASE_URL } from "../../../config";
import "./CrmProfile.css";

export default function CrmProfile() {
  const { subAdmin, updateSubAdmin } = useCrmAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    async function loadFreshSubAdminProfile() {
      const storedToken = localStorage.getItem("subAdminToken");
      const storedUser = localStorage.getItem("subAdminUser");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      const subAdminId = parsed?._id || parsed?.id;

      try {
        const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
        const url = subAdminId
          ? `${API_BASE_URL}/subadmin-auth/profile?id=${subAdminId}`
          : `${API_BASE_URL}/subadmin-auth/profile`;
        const res = await axios.get(url, { headers });
        if (res.data && res.data.subAdmin) {
          updateSubAdmin(res.data.subAdmin);
        }
      } catch (err) {
        console.warn("Could not sync fresh subadmin profile:", err.message);
      }
    }
    loadFreshSubAdminProfile();
  }, []);

  const getSubAdminAvatar = (img) => {
    if (!img) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(subAdmin?.name || "SubAdmin")}&background=0D8ABC&color=fff`;
    }
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `${SERVER_URL}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const subAdminId = subAdmin?._id || subAdmin?.id;
    const formData = new FormData();
    formData.append("image", file);
    if (subAdminId) formData.append("id", subAdminId);
    if (subAdmin?.email) formData.append("email", subAdmin.email);

    setUploading(true);
    try {
      const token = localStorage.getItem("subAdminToken");
      const headers = {
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await axios.put(
        `${API_BASE_URL}/subadmin-auth/profile-image`,
        formData,
        { headers }
      );

      if (res.data && res.data.subAdmin) {
        updateSubAdmin(res.data.subAdmin);
        showSuccessAlert("Profile picture updated successfully!", 1200);
      }
    } catch (err) {
      console.error("Failed to upload profile image:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update profile picture");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const savedSystemIp = localStorage.getItem("crm_system_ip") || "49.43.110.164";

  const subAdminData = {
    name: subAdmin?.name || "Ritesh Kumar",
    role: subAdmin?.role === "subadmin" ? "Sub Admin" : (subAdmin?.role || "Sub Admin"),
    status: subAdmin?.status !== false ? "Active" : "Inactive",
    image: getSubAdminAvatar(subAdmin?.profileImage),
    email: subAdmin?.email || "ritesh@bhrosacab.com",
  
    location: `${subAdmin?.city || "Zirakpur"}, ${subAdmin?.state || "Chandigarh"}`,
    country: subAdmin?.country || "India",
    state: subAdmin?.state || "Chandigarh",
    city: subAdmin?.city || "Zirakpur",
    minimumMg: subAdmin?.minimumMG ? Number(subAdmin.minimumMG).toFixed(2) : "50000.00",
    commission: subAdmin?.commission !== undefined ? subAdmin.commission : "15.00",
    agreementUrl: subAdmin?.agreement
      ? (subAdmin.agreement.startsWith("http") ? subAdmin.agreement : `${SERVER_URL}${subAdmin.agreement.startsWith("/") ? "" : "/"}${subAdmin.agreement}`)
      : null,
    ipAddress: subAdmin?.ipAddress || savedSystemIp,
    address: subAdmin?.address || "Sushma infinium, Ambala Road, Preet Colony, Utrathiya, Zirakpur, Punjab 140603",
    createdDate: subAdmin?.createdAt ? new Date(subAdmin.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "24 Aug 2026, 09:50 AM",
    updatedDate: subAdmin?.updatedAt ? new Date(subAdmin.updatedAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' }) : "26 Aug 2026, 06:03 AM",
  };

  return (
    <div className="crm-profile-page-wrap">
      {/* Title */}
      <div className="crm-profile-page-header">
        <h4 className="crm-profile-page-title">My Profile</h4>
        <p className="crm-profile-page-subtitle">Manage and view your profile information</p>
      </div>

      <div className="crm-profile-grid">
        {/* Left Column: Profile Card */}
        <div className="crm-profile-left-col">
          <div className="crm-profile-card">
            <div className="crm-profile-cover"></div>

            <div className="crm-profile-body">
              <div className="crm-profile-avatar-wrap">
                <img
                  src={subAdminData.image}
                  alt={subAdminData.name}
                  className="crm-profile-avatar"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(subAdminData.name)}&background=0D8ABC&color=fff`;
                  }}
                />
                <button
                  type="button"
                  className="crm-avatar-edit-btn"
                  title="Change Profile Photo"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <RefreshCw size={15} className="spin" /> : <Camera size={15} />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <button
                type="button"
                className="crm-change-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera size={14} />
                <span>{uploading ? "Updating..." : "Change Profile Photo"}</span>
              </button>

              <h3 className="crm-profile-user-name">{subAdminData.name}</h3>
              <p className="crm-profile-user-role">{subAdminData.role}</p>

              <span className={`crm-profile-status-badge ${subAdminData.status.toLowerCase()}`}>
                {subAdminData.status === "Active" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                <span>{subAdminData.status}</span>
              </span>

              <hr className="crm-profile-divider" />

              <div className="crm-profile-contact-list">
                <div className="crm-profile-contact-item">
                  <div className="crm-profile-contact-icon">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{subAdminData.email}</strong>
                  </div>
                </div>

                <div className="crm-profile-contact-item">
                  
                 
                </div>

                <div className="crm-profile-contact-item">
                  <div className="crm-profile-contact-icon">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>{subAdminData.location}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Information Cards */}
        <div className="crm-profile-right-col">
          {/* Personal Information */}
          <div className="crm-profile-info-card">
            <div className="crm-profile-card-head">
              <h4 className="crm-profile-card-title">Personal Information</h4>
              <p className="crm-profile-card-desc">Basic information associated with this account</p>
            </div>

            <div className="crm-profile-card-body">
              <div className="crm-profile-info-boxes-grid">
                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><User size={18} /></div>
                  <div className="crm-pib-content">
                    <span>Full Name</span>
                    <h5>{subAdminData.name}</h5>
                  </div>
                </div>

                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><Mail size={18} /></div>
                  <div className="crm-pib-content">
                    <span>Email Address</span>
                    <h5>{subAdminData.email}</h5>
                  </div>
                </div>

                <div className="crm-profile-info-box">
                 
                 
                </div>

                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><Globe size={18} /></div>
                  <div className="crm-pib-content">
                    <span>Country</span>
                    <h5>{subAdminData.country}</h5>
                  </div>
                </div>

                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><Map size={18} /></div>
                  <div className="crm-pib-content">
                    <span>State</span>
                    <h5>{subAdminData.state}</h5>
                  </div>
                </div>

                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><Building size={18} /></div>
                  <div className="crm-pib-content">
                    <span>City</span>
                    <h5>{subAdminData.city}</h5>
                  </div>
                </div>

                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><MapPin size={18} /></div>
                  <div className="crm-pib-content">
                    <span>Minimum MG</span>
                    <h5>{subAdminData.minimumMg}</h5>
                  </div>
                </div>

                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><FileText size={18} /></div>
                  <div className="crm-pib-content">
                    <span>Agreement</span>
                    <h5>
                      <a href={subAdminData.agreementUrl} target="_blank" rel="noreferrer">
                        View
                      </a>
                    </h5>
                  </div>
                </div>

                <div className="crm-profile-info-box">
                  <div className="crm-pib-icon"><FileText size={18} /></div>
                  <div className="crm-pib-content">
                    <span>Commission</span>
                    <h5>{subAdminData.commission}%</h5>
                  </div>
                </div>
              </div>

              {/* Address Box */}
              <div className="crm-profile-address-box">
                <div className="crm-pab-icon"><MapPin size={20} /></div>
                <div>
                  <span>Address</span>
                  <p>{subAdminData.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="crm-profile-info-card">
            <div className="crm-profile-card-head">
              <h4 className="crm-profile-card-title">Account Information</h4>
              <p className="crm-profile-card-desc">Account and system related details</p>
            </div>

            <div className="crm-profile-card-body">
              <div className="crm-profile-account-grid">
                <div className="crm-profile-acc-item">
                  <span className="label">Account Status</span>
                  <span className="crm-profile-status-badge inactive small">Inactive</span>
                </div>

                <div className="crm-profile-acc-item">
                  <span className="label">IP Address</span>
                  <strong>{subAdminData.ipAddress}</strong>
                </div>

                <div className="crm-profile-acc-item">
                  <span className="label">Agreement</span>
                  <a
                    href={subAdminData.agreementUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="crm-profile-agreement-btn"
                  >
                    <FileText size={14} />
                    <span>View Agreement</span>
                  </a>
                </div>

                <div className="crm-profile-acc-item">
                  <span className="label">Minimum Amount</span>
                  <strong className="amount">₹{Number(subAdminData.minimumMg).toLocaleString("en-IN")}.00</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2 Cards */}
          <div className="crm-profile-bottom-row">
            {/* Address Card */}
            <div className="crm-profile-info-card flex-1">
              <div className="crm-profile-card-head">
                <h4 className="crm-profile-card-title d-flex align-items-center gap-2">
                  <MapPin size={18} className="text-primary" />
                  Address
                </h4>
              </div>
              <div className="crm-profile-card-body">
                <p className="crm-pab-text">{subAdminData.address}</p>
                <div className="crm-pab-lines">
                  <div className="crm-pab-line">
                    <Building size={15} /> <span>{subAdminData.city}</span>
                  </div>
                  <div className="crm-pab-line">
                    <Map size={15} /> <span>{subAdminData.state}</span>
                  </div>
                  <div className="crm-pab-line">
                    <Globe size={15} /> <span>{subAdminData.country}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Timeline Card */}
            <div className="crm-profile-info-card flex-1">
              <div className="crm-profile-card-head">
                <h4 className="crm-profile-card-title d-flex align-items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  Account Timeline
                </h4>
              </div>
              <div className="crm-profile-card-body">
                <div className="crm-profile-timeline-item">
                  <div className="crm-timeline-icon"><UserPlus size={16} /></div>
                  <div>
                    <span>Account Created</span>
                    <h5>{subAdminData.createdDate}</h5>
                  </div>
                </div>

                <div className="crm-profile-timeline-item mt-3">
                  <div className="crm-timeline-icon"><RefreshCw size={16} /></div>
                  <div>
                    <span>Last Updated</span>
                    <h5>{subAdminData.updatedDate}</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
