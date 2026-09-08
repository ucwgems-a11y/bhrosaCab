import { useState } from "react";
import axios from "axios";
import { Lock, Key, CheckCircle, Shield, Info, Eye, EyeOff } from "lucide-react";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import { swalWithBootstrapButtons } from "../../../utils/sweetAlert";
import { API_BASE_URL } from "../../../config";
import "./CrmChangePassword.css";

export default function CrmChangePassword() {
  const { subAdmin } = useCrmAuth();
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (formData.new_password !== formData.confirm_password) {
      swalWithBootstrapButtons.fire({
        title: "Password Mismatch",
        text: "New Password and Confirm New Password do not match!",
        icon: "error",
      });
      return;
    }

    if (formData.new_password.length < 6) {
      swalWithBootstrapButtons.fire({
        title: "Weak Password",
        text: "Password must be at least 6 characters long.",
        icon: "warning",
      });
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/subadmin-auth/change-password`, {
        old_password: formData.old_password,
        new_password: formData.new_password,
        email: subAdmin?.email,
      });

      swalWithBootstrapButtons.fire({
        title: "Password Updated!",
        text: res.data?.message || "Your password has been changed successfully.",
        icon: "success",
      });

      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update password. Please check your old password.";
      swalWithBootstrapButtons.fire({
        title: "Update Failed",
        text: msg,
        icon: "error",
      });
    }
  }

  return (
    <div className="crm-password-page-wrap">
      <div className="crm-password-page-header">
        <h3 className="crm-password-page-title">
          <Lock className="crm-header-icon" size={24} />
          Change Password
        </h3>
        <p className="crm-password-page-subtitle">Update your account password securely</p>
      </div>

      <div className="crm-password-card">
        <div className="crm-password-card-header">
          <div className="crm-password-card-icon">
            <Key size={22} />
          </div>
          <div>
            <h4 className="crm-password-card-title">Update Password</h4>
            <p className="crm-password-card-subtitle">Enter your current password and choose a new password</p>
          </div>
        </div>

        <div className="crm-password-card-body">
          {/* Security Banner */}
          <div className="crm-security-info">
            <div className="crm-security-icon">
              <Shield size={20} />
            </div>
            <div className="crm-security-content">
              <strong>Keep your account secure</strong>
              <p>Use a strong password that you don't use on any other website or application.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="crm-password-form">
            <div className="crm-password-grid">
              {/* Old Password */}
              <div className="crm-password-form-group">
                <label>
                  Old Password <span className="text-danger">*</span>
                </label>
                <div className="crm-password-input-wrapper">
                  <Lock className="crm-input-left-icon" size={16} />
                  <input
                    type={showOld ? "text" : "password"}
                    name="old_password"
                    placeholder="Enter old password"
                    value={formData.old_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="crm-password-toggle-btn"
                    onClick={() => setShowOld((prev) => !prev)}
                  >
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="crm-password-form-group">
                <label>
                  New Password <span className="text-danger">*</span>
                </label>
                <div className="crm-password-input-wrapper">
                  <Key className="crm-input-left-icon" size={16} />
                  <input
                    type={showNew ? "text" : "password"}
                    name="new_password"
                    placeholder="Enter new password"
                    value={formData.new_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="crm-password-toggle-btn"
                    onClick={() => setShowNew((prev) => !prev)}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="crm-password-form-group">
                <label>
                  Confirm New Password <span className="text-danger">*</span>
                </label>
                <div className="crm-password-input-wrapper">
                  <CheckCircle className="crm-input-left-icon" size={16} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirm_password"
                    placeholder="Confirm new password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="crm-password-toggle-btn"
                    onClick={() => setShowConfirm((prev) => !prev)}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Tips */}
              <div className="crm-password-tips-card">
                <div className="crm-password-tips-title">
                  <Info size={16} />
                  <span>Password Tips</span>
                </div>
                <ul>
                  <li>Use at least 8 characters</li>
                  <li>Use a combination of letters and numbers</li>
                  <li>Avoid using easily guessable passwords</li>
                </ul>
              </div>
            </div>

            <div className="crm-password-submit-area">
              <button type="submit" className="crm-password-submit-btn">
                <Key size={16} />
                <span>Change Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
