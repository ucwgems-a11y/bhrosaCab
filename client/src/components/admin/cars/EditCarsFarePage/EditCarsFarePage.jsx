import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditCarsFarePage.css";

export default function EditCarsFarePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleType, setVehicleType] = useState("");
  const [farePerKm, setFarePerKm] = useState("");
  const [farePerKmTo, setFarePerKmTo] = useState("");
  const [outStationAboveKm, setOutStationAboveKm] = useState("");
  const [outStationAbovePrice, setOutStationAbovePrice] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [typeRes, fareRes] = await Promise.all([
          api.get("/cars/types"),
          api.get(`/cars/fares/${id}`),
        ]);
        if (typeRes.data && typeRes.data.types) setVehicleTypes(typeRes.data.types);
        if (fareRes.data && fareRes.data.fare) {
          const f = fareRes.data.fare;
          setVehicleType(f.vehicleType);
          setFarePerKm(f.farePerKm || "");
          setFarePerKmTo(f.farePerKmTo || "");
          setOutStationAboveKm(f.osAboveDistance || "");
          setOutStationAbovePrice(f.osAbovePrice || "");
          setPreviewImage(f.image || "");
        }
      } catch (err) {
        console.error("Failed to load fare details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
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
    setSubmitting(true);

    try {
      const formData = new FormData();
      if (vehicleType) formData.append("vehicleType", vehicleType);
      formData.append("farePerKm", farePerKm || "0.00");
      formData.append("farePerKmTo", farePerKmTo || "");
      formData.append("outStationAboveKm", outStationAboveKm || "");
      formData.append("outStationAbovePrice", outStationAbovePrice || "0.00");
      if (selectedFile) formData.append("image", selectedFile);

      const res = await api.put(`/cars/fares/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/cars/fare");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update fare:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update fare");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/cars/fare");
  }

  const selectedVehicleName =
    vehicleTypes.find((v) => String(v.id || v.mysqlId) === String(vehicleType))?.name || "Vehicle";

  return (
    <div className="edit-fare-page">
      {/* Header & Back Navigation */}
      <div className="edit-fare-topbar">
        <button className="edit-fare-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Cars &amp; Fare</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-fare-alert-success">
          <CheckCircle2 size={18} />
          <span>Fare details for <strong>{selectedVehicleName}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-fare-card">
        <div className="edit-fare-card-header">
          <div className="edit-fare-header-icon">
            <Car size={20} />
          </div>
          <div>
            <h3 className="edit-fare-card-title">Edit Fare Per KM</h3>
            <p className="edit-fare-card-subtitle">
              Update distance pricing and outstation rates for #{id} ({selectedVehicleName})
            </p>
          </div>
        </div>

        <div className="edit-fare-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-fare-form-grid">
              {/* Vehicle Type */}
              <div className="edit-fare-form-group">
                <label>
                  Vehicle Type <span className="edit-fare-req">*</span>
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map((v) => (
                    <option key={v.id || v._id} value={v.id || v.mysqlId || v._id}>
                      {v.name || v.typeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fare Per KM */}
              <div className="edit-fare-form-group">
                <label>
                  Fare Per KM (₹) <span className="edit-fare-req">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20.00"
                  value={farePerKm}
                  onChange={(e) => setFarePerKm(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Fare Per KM To */}
              <div className="edit-fare-form-group">
                <label>Fare Per KM To (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 27.00"
                  value={farePerKmTo}
                  onChange={(e) => setFarePerKmTo(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Out Station Above Distance */}
              <div className="edit-fare-form-group">
                <label>Out Station Above Distance (KM)</label>
                <input
                  type="text"
                  placeholder="e.g. 40"
                  value={outStationAboveKm}
                  onChange={(e) => setOutStationAboveKm(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Out Station Above Price */}
              <div className="edit-fare-form-group">
                <label>Out Station Above Price (₹)</label>
                <input
                  type="text"
                  placeholder="e.g. 17.00"
                  value={outStationAbovePrice}
                  onChange={(e) => setOutStationAbovePrice(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Image Upload & Preview */}
              <div className="edit-fare-form-group edit-fare-image-group">
                <label>Vehicle Image</label>
                <div className="edit-fare-image-row">
                  {previewImage && (
                    <div className="edit-fare-preview-box">
                      <img src={previewImage} alt="Vehicle Preview" />
                    </div>
                  )}
                  <label className="edit-fare-file-btn">
                    <Upload size={16} />
                    <span>Choose New Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="edit-fare-actions">
              <button
                type="submit"
                className="edit-fare-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Fare"}
              </button>
              <button
                type="button"
                className="edit-fare-btn-cancel"
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
