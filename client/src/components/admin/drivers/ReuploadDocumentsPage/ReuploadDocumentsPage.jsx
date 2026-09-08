import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./ReuploadDocumentsPage.css";

const docFields = [
  { key: "vehicle_front_image", label: "Vehicle Front Image" },
  { key: "vehicle_back_image", label: "Vehicle Back Image" },
  { key: "driving_licence_front", label: "Driving Licence Front" },
  { key: "driving_licence_back", label: "Driving Licence Back" },
  { key: "insurence_front", label: "Insurance Front" },
  { key: "insurence_back", label: "Insurance Back" },
  { key: "id_proof_front", label: "ID Proof Front" },
  { key: "id_proof_back", label: "ID Proof Back" },
  { key: "vehicle_rc_front", label: "Vehicle RC Front" },
  { key: "vehicle_rc_back", label: "Vehicle RC Back" },
  { key: "government_id_proof", label: "Government ID" },
];

export default function ReuploadDocumentsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});
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
          setDriver(d);
          setPreviews({
            vehicle_front_image: d.vehicleFront || d.vehicle_front_image,
            vehicle_back_image: d.vehicleBack || d.vehicle_back_image,
            driving_licence_front: d.licenceFront || d.driving_licence_front,
            driving_licence_back: d.licenceBack || d.driving_licence_back,
            insurence_front: d.insuranceFront || d.insurence_front,
            insurence_back: d.insuranceBack || d.insurence_back,
            id_proof_front: d.idProofFront || d.id_proof_front,
            id_proof_back: d.idProofBack || d.id_proof_back,
            vehicle_rc_front: d.rcFront || d.vehicle_rc_front,
            vehicle_rc_back: d.rcBack || d.vehicle_rc_back,
            government_id_proof: d.govtIdProof || d.government_id_proof,
          });
        }
      } catch (err) {
        console.error("Failed to load driver:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDriver();
  }, [id]);

  function handleFileChange(key, file) {
    if (file) {
      setFiles((prev) => ({ ...prev, [key]: file }));
      setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const uploadedKeys = Object.keys(files);
    if (uploadedKeys.length === 0) {
      showErrorAlert("Please select at least one document to re-upload");
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      uploadedKeys.forEach((key) => {
        formData.append(key, files[key]);
      });

      const res = await api.put(`/drivers/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Driver documents re-uploaded and saved successfully!", 1000);
        setTimeout(() => {
          navigate("/admin/drivers/verification");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to upload documents:", err);
      showErrorAlert(err.response?.data?.message || "Failed to re-upload documents");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/drivers/verification");
  }

  return (
    <div className="reupload-page-wrap">
      {/* Topbar Back Navigation */}
      <div className="reupload-topbar">
        <button className="reupload-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Driver Verification</span>
        </button>
      </div>

      {showSuccess && (
        <div className="reupload-alert-success">
          <CheckCircle2 size={18} />
          <span>Driver #{id} documents re-uploaded and saved in database successfully!</span>
        </div>
      )}

      <div className="reupload-card">
        <div className="reupload-card-header">
          <div className="reupload-header-icon">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="reupload-card-title">Re-Upload Driver Documents</h3>
            <p className="reupload-card-subtitle">
              Replace rejected or missing KYC/vehicle certificates for Driver: <strong>{driver?.name || `#${id}`}</strong>
            </p>
          </div>
        </div>

        <div className="reupload-card-body">
          <form onSubmit={handleSubmit}>
            <div className="reupload-grid">
              {docFields.map((doc) => {
                const currentPreview = previews[doc.key];
                const hasUploaded = Boolean(files[doc.key]);

                return (
                  <div className="reupload-doc-card" key={doc.key}>
                    <div className="reupload-doc-header">
                      <span className="reupload-doc-title">{doc.label}</span>
                      {hasUploaded && (
                        <span className="reupload-badge-new">New Selected</span>
                      )}
                    </div>

                    <div className="reupload-preview-container">
                      <img
                        src={currentPreview || "/no-document.png"}
                        alt={doc.label}
                        className="reupload-preview-img"
                        style={{
                          objectFit: "contain",
                          background: currentPreview ? "transparent" : "#ffffff",
                          padding: currentPreview ? "0" : "8px",
                        }}
                        onError={(e) => {
                          e.target.src = "/no-document.png";
                          e.target.style.background = "#ffffff";
                        }}
                      />
                    </div>

                    <div className="reupload-upload-btn-wrap">
                      <label className="reupload-file-label">
                        <span className="reupload-upload-icon"><Upload size={17} /></span>
                        <span>{currentPreview ? "Change Document" : "Upload Document"}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange(doc.key, e.target.files[0])}
                          style={{ display: "none" }}
                          disabled={loading || submitting}
                        />
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="reupload-actions">
              <button
                type="submit"
                className="reupload-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Saving to Database..." : "Save Re-uploaded Documents"}
              </button>
              <button
                type="button"
                className="reupload-btn-cancel"
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
