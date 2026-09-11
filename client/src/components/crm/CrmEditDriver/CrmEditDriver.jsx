import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import api from "../../../api/axios";
import "./CrmEditDriver.css";

const categories = [
  { value: "1", label: "Bike" },
  { value: "2", label: "Auto" },
  { value: "3", label: "Hatchback" },
  { value: "4", label: "Sedan" },
  { value: "5", label: "Mini SUV" },
  { value: "6", label: "Premium SUV" },
  { value: "7", label: "Any Premium Car" },
];

export default function CrmEditDriver() {
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
          setCategory(d.category || d.cateogory || "3");
          setWallet(d.wallet || 0);
          if (d.image) setPreviewUrl(d.image);
        }
      } catch (err) {
        console.error("Failed to load driver:", err);
        showErrorAlert("Failed to load driver details");
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
        showSuccessAlert("Driver profile updated successfully in database!", 1200);
        setTimeout(() => {
          navigate(`/crm-driver-profile/${id}`);
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to update driver:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update driver profile");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="crm-editdriver-page-wrap" style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
        <h2>Loading Driver Details...</h2>
      </div>
    );
  }

  return (
    <div className="crm-editdriver-page-wrap">
      <div className="crm-editdriver-card">
        <div className="crm-editdriver-card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h4 className="crm-editdriver-heading" style={{ margin: 0 }}>Edit Driver Details</h4>
            <button
              type="button"
              className="crm-editdriver-btn cancel"
              onClick={() => navigate(-1)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <form className="crm-editdriver-form" onSubmit={handleSubmit}>
            {/* Image Preview & Upload */}
            <div className="crm-editdriver-field">
              <label className="crm-editdriver-label">Driver Profile Photo</label>
              {previewUrl && (
                <div className="crm-editdriver-img-preview-box">
                  <img
                    src={previewUrl}
                    alt="Driver Preview"
                    className="crm-editdriver-img-preview"
                    onError={(e) => {
                      e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(name || "Driver");
                    }}
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="crm-editdriver-file-input"
                onChange={handleImageChange}
              />
            </div>

            {/* Name */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">First Name *</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Last Name</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Phone Number *</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Email Address</label>
                <input
                  type="email"
                  className="crm-editdriver-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* State & Address */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">State</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Address</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* License & Aadhaar */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Driving License Number</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Aadhaar Number</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Vehicle Brand</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Vehicle Model</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Vehicle Number</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                />
              </div>
            </div>

            {/* Color, Year, Category */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Vehicle Color</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Manufacturing Year</label>
                <input
                  type="text"
                  className="crm-editdriver-input"
                  value={manufacturingYear}
                  onChange={(e) => setManufacturingYear(e.target.value)}
                />
              </div>
              <div className="crm-editdriver-field">
                <label className="crm-editdriver-label">Vehicle Category</label>
                <select
                  className="crm-editdriver-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Wallet Balance */}
            <div className="crm-editdriver-field" style={{ maxWidth: "300px" }}>
              <label className="crm-editdriver-label">Wallet Balance (₹)</label>
              <input
                type="number"
                step="0.01"
                className="crm-editdriver-input"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="crm-editdriver-actions">
              <button
                type="button"
                className="crm-editdriver-btn cancel"
                onClick={() => navigate(-1)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="crm-editdriver-btn submit"
                disabled={submitting}
              >
                {submitting ? "Saving to Database..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
