import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCheck, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditDriverPage.css";

const categories = [
  { value: "1", label: "Bike" },
  { value: "2", label: "Auto" },
  { value: "3", label: "Hatchback" },
  { value: "4", label: "Sedan" },
  { value: "5", label: "Mini SUV" },
  { value: "6", label: "Premium SUV" },
  { value: "7", label: "Any Premium Car" },
];

export default function EditDriverPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [color, setColor] = useState("");
  const [manufacturingYear, setManufacturingYear] = useState("");
  const [category, setCategory] = useState("3");
  const [wallet, setWallet] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadDriver() {
      setLoading(true);
      try {
        const res = await api.get(`/drivers/${id}`);
        if (res.data && (res.data.driver || res.data.data)) {
          const d = res.data.driver || res.data.data;
          setName(d.name || "");
          setLastName(d.last_name || d.lastName || "");
          setEmail(d.email || "");
          setPhone(d.number || d.phone || "");
          setAddress(d.address || "");
          setState(d.state || "");
          setLicenseNumber(d.license_number || d.licenseNumber || "");
          setAadhaarNumber(d.aadhaar_number || d.aadhaarNumber || "");
          setBrand(d.brand || "");
          setModel(d.model || "");
          setVehicleNumber(d.vehicle_number || d.vehicleNumber || "");
          setColor(d.color || "");
          setManufacturingYear(d.manufacturing_year || "");
          setCategory(d.cateogory || "3");
          setWallet(d.wallet || 0);
          if (d.image) setPreviewUrl(d.image);
        }
      } catch (err) {
        console.error("Failed to load driver:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDriver();
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showErrorAlert("Please enter driver name and phone number");
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("last_name", lastName.trim());
      formData.append("email", email.trim());
      formData.append("number", phone.trim());
      formData.append("address", address.trim());
      formData.append("state", state.trim());
      formData.append("license_number", licenseNumber.trim());
      formData.append("aadhaar_number", aadhaarNumber.trim());
      formData.append("brand", brand.trim());
      formData.append("model", model.trim());
      formData.append("vehicle_number", vehicleNumber.trim());
      formData.append("color", color.trim());
      formData.append("manufacturing_year", manufacturingYear.trim());
      formData.append("cateogory", category);
      formData.append("wallet", Number(wallet) || 0);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await api.put(`/drivers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Driver profile updated successfully!", 1000);
        setTimeout(() => {
          navigate("/admin/drivers/manage");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update driver:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update driver profile");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/drivers/manage");
  }

  return (
    <div className="edit-driver-page">
      {/* Topbar Back Navigation */}
      <div className="edit-driver-topbar">
        <button className="edit-driver-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Manage Drivers</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-driver-alert-success">
          <CheckCircle2 size={18} />
          <span>Driver <strong>{name}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-driver-card">
        <div className="edit-driver-card-header">
          <div className="edit-driver-header-icon">
            <UserCheck size={20} />
          </div>
          <div>
            <h3 className="edit-driver-card-title">Edit Driver Information</h3>
            <p className="edit-driver-card-subtitle">
              Update personal details, vehicle assignment &amp; license for #{id}
            </p>
          </div>
        </div>

        <div className="edit-driver-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-driver-form-grid">
              {/* Profile Image Row */}
              <div className="edit-driver-form-group edit-driver-full-width">
                <label>Profile Picture</label>
                <div className="edit-driver-image-row">
                  <div className="edit-driver-preview-box">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Driver Preview" />
                    ) : (
                      <span style={{ fontSize: "28px" }}>👤</span>
                    )}
                  </div>
                  <label className="edit-driver-upload-btn">
                    <Upload size={16} />
                    <span>Choose New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div className="edit-driver-form-group">
                <label>First Name <span className="edit-driver-req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Last Name */}
              <div className="edit-driver-form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  placeholder="e.g. Patel"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Phone */}
              <div className="edit-driver-form-group">
                <label>Phone Number <span className="edit-driver-req">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="edit-driver-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. driver@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* State */}
              <div className="edit-driver-form-group">
                <label>State / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Maharashtra, Punjab, Delhi"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Address */}
              <div className="edit-driver-form-group">
                <label>Residential Address</label>
                <input
                  type="text"
                  placeholder="Full address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* License Number */}
              <div className="edit-driver-form-group">
                <label>Driving License Number</label>
                <input
                  type="text"
                  placeholder="e.g. DL0120220019283"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Aadhaar Number */}
              <div className="edit-driver-form-group">
                <label>Aadhaar Card Number</label>
                <input
                  type="text"
                  placeholder="e.g. 860730120211"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Vehicle Number */}
              <div className="edit-driver-form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  placeholder="e.g. MH02GS3021"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Vehicle Category */}
              <div className="edit-driver-form-group">
                <label>Vehicle Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value || c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div className="edit-driver-form-group">
                <label>Vehicle Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Maruti Suzuki, Hyundai"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Model */}
              <div className="edit-driver-form-group">
                <label>Vehicle Model</label>
                <input
                  type="text"
                  placeholder="e.g. Swift Dzire 2026"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="edit-driver-actions">
              <button
                type="submit"
                className="edit-driver-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Driver"}
              </button>
              <button
                type="button"
                className="edit-driver-btn-cancel"
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
