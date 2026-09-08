import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditContactUsPage.css";

export default function EditContactUsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [logo, setLogo] = useState("📞");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadContact() {
      setLoading(true);
      try {
        const res = await api.get(`/settings/contact-us/${id}`);
        if (res.data && res.data.data) {
          const c = res.data.data;
          setName(c.name || "");
          setAddress(c.address || "");
          setLogo(c.logo || "📞");
          if (c.image) setPreviewImage(c.image);
        }
      } catch (err) {
        console.error("Failed to load contact details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadContact();
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("address", address.trim());
      formData.append("logo", logo);
      if (selectedFile) formData.append("image", selectedFile);

      const res = await api.put(`/settings/contact-us/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/settings/contact-us");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update contact:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update contact channel");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/settings/contact-us");
  }

  return (
    <div className="edit-contact-page">
      <div className="edit-contact-topbar">
        <button className="edit-contact-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Contact Us</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-contact-alert-success">
          <CheckCircle2 size={18} />
          <span>Contact channel <strong>{name}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-contact-card">
        <div className="edit-contact-card-header">
          <div className="edit-contact-header-icon">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="edit-contact-card-title">Edit Contact Channel</h3>
            <p className="edit-contact-card-subtitle">
              Update support &amp; social channel details for #{id}
            </p>
          </div>
        </div>

        <div className="edit-contact-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-contact-form-group">
              <label>
                Channel Name <span className="edit-contact-req">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. WhatsApp, Customer Care, Twitter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-contact-form-group">
              <label>
                Address / Value / URL <span className="edit-contact-req">*</span>
              </label>
              <input
                type="text"
                placeholder="Phone number, email, address, or social link"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="edit-contact-form-group">
              <label>Channel Icon / Graphic</label>
              <div className="edit-contact-image-row">
                <div className="edit-contact-logo-box">
                  {previewImage ? (
                    <img src={previewImage} alt="Icon Preview" />
                  ) : (
                    <span style={{ fontSize: "28px" }}>{logo}</span>
                  )}
                </div>
                <label className="edit-contact-upload-btn">
                  <Upload size={16} />
                  <span>Choose Icon / Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div className="edit-contact-actions">
              <button
                type="submit"
                className="edit-contact-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Contact"}
              </button>
              <button
                type="button"
                className="edit-contact-btn-cancel"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
