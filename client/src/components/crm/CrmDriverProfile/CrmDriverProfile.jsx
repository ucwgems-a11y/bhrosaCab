import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, ArrowLeft, Eye } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import api from "../../../api/axios";
import "./CrmDriverProfile.css";

export default function CrmDriverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zoomImage, setZoomImage] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingStatus, setSubmittingStatus] = useState(false);

  useEffect(() => {
    fetchDriverProfile();
  }, [id]);

  async function fetchDriverProfile() {
    setLoading(true);
    try {
      const res = await api.get(`/drivers/${id}`);
      if (res.data && (res.data.driver || res.data.data)) {
        setDriver(res.data.driver || res.data.data);
      }
    } catch (err) {
      console.error("Failed to load CRM driver profile:", err);
      showErrorAlert("Failed to load driver details");
    } finally {
      setLoading(false);
    }
  }

  function handleApprove() {
    swalWithBootstrapButtons
      .fire({
        title: "Approve Driver?",
        text: "Are you sure you want to approve this driver and activate their account?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, approve driver!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          setSubmittingStatus(true);
          try {
            await api.put(`/drivers/${id}/status`, {
              status: 2,
              document_verify_status: "accepted",
              driving_licence_status: "approved",
              aadhaar_number_status: "approved",
            });
            showSuccessAlert("Driver has been approved successfully!");
            fetchDriverProfile();
          } catch (err) {
            console.error("Failed to approve driver:", err);
            showErrorAlert("Failed to approve driver");
          } finally {
            setSubmittingStatus(false);
          }
        }
      });
  }

  function handleReject() {
    swalWithBootstrapButtons
      .fire({
        title: "Reject Driver?",
        text: "Are you sure you want to reject this driver's application?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, reject driver!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          setSubmittingStatus(true);
          try {
            await api.put(`/drivers/${id}/status`, {
              status: 3,
              document_verify_status: "rejected",
              driving_licence_status: "rejected",
              aadhaar_number_status: "rejected",
            });
            showSuccessAlert("Driver application has been rejected.");
            fetchDriverProfile();
          } catch (err) {
            console.error("Failed to reject driver:", err);
            showErrorAlert("Failed to reject driver");
          } finally {
            setSubmittingStatus(false);
          }
        }
      });
  }

  if (loading) {
    return (
      <div className="crm-driverprofile-page-wrap" style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
        <h2>Loading Driver Profile from Database...</h2>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="crm-driverprofile-page-wrap" style={{ textAlign: "center", padding: "60px" }}>
        <h2>Driver not found</h2>
        <button
          className="crm-dp-btn btn-warning"
          onClick={() => navigate("/crm-user-driver")}
          style={{ marginTop: "16px" }}
        >
          Back to Drivers List
        </button>
      </div>
    );
  }

  const isApproved = driver.status === 2 || driver.status === "Approved" || driver.statusCode === 2;
  const isRejected = driver.status === 3 || driver.status === "Rejected" || driver.statusCode === 3;
  const isPending = !isApproved && !isRejected;

  const rows = [
    { label: "Driver Name:", value: (driver.name || "") + (driver.lastName || driver.last_name ? " " + (driver.lastName || driver.last_name) : "") },
    { label: "Phone Number:", value: driver.number || driver.phone || "N/A" },
    { label: "Email Address:", value: driver.email || "N/A" },
    { label: "State / Location:", value: driver.state || "N/A" },
    { label: "Wallet Balance:", value: "₹ " + Number(driver.wallet || 0).toFixed(2) },
    { label: "License Number:", value: driver.license_number || driver.licenseNumber || "N/A" },
    { label: "Aadhaar Number:", value: driver.aadhaar_number || driver.aadhaarNumber || "N/A" },
    { label: "Aadhaar Status:", value: driver.aadhaar_number_status || driver.aadhaarStatus || "pending" },
    { label: "Licence Status:", value: driver.driving_licence_status || driver.licenceStatus || "pending" },
    { label: "Vehicle Brand:", value: driver.brand || driver.vehicleBrand || "N/A" },
    { label: "Vehicle Model:", value: driver.model || driver.vehicleModel || "N/A" },
    { label: "Vehicle Number:", value: driver.vehicle_number || driver.vehicleNumber || "N/A" },
    { label: "Vehicle Category:", value: driver.category || driver.cateogory || driver.vehicleCategory || "Hatchback" },
    { label: "Application Status:", value: isApproved ? "Approved" : isRejected ? "Rejected" : "Pending" },
  ];

  const imageRows = [
    { label: "Driver Photo:", src: driver.image || driver.driver_image },
    { label: "Vehicle Front Image:", src: driver.vehicleFront || driver.vehicle_front_image },
    { label: "Vehicle Back Image:", src: driver.vehicleBack || driver.vehicle_back_image },
    { label: "Vehicle Interior Image:", src: driver.vehicleInterior || driver.vehicle_interior_image },
    { label: "Licence Front:", src: driver.licenceFront || driver.driving_licence_front },
    { label: "Licence Back:", src: driver.licenceBack || driver.driving_licence_back },
    { label: "Vehicle RC Front:", src: driver.rcFront || driver.vehicle_rc_front },
    { label: "Vehicle RC Back:", src: driver.rcBack || driver.vehicle_rc_back },
    { label: "Government / ID Proof Front:", src: driver.idProofFront || driver.id_proof_front },
    { label: "Government / ID Proof Back:", src: driver.idProofBack || driver.id_proof_back },
  ];

  return (
    <div className="crm-driverprofile-page-wrap">
      <div className="crm-driverprofile-card">
        {/* Header and Actions */}
        <div className="crm-driverprofile-header-wrap">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <button
              className="crm-dp-btn btn-secondary"
              onClick={() => navigate("/crm-user-driver")}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--bg-panel)" }}
            >
              <ArrowLeft size={16} /> Back to Drivers
            </button>

            <span
              style={{
                display: "inline-block",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                background: isApproved ? "rgba(16, 185, 129, 0.15)" : isRejected ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                color: isApproved ? "#10b981" : isRejected ? "#ef4444" : "#f59e0b",
                border: isApproved ? "1px solid rgba(16, 185, 129, 0.3)" : isRejected ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              Status: {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending Approval"}
            </span>
          </div>

          <h2 className="crm-driverprofile-heading">Driver Profile &amp; Verification</h2>

          <div className="crm-driverprofile-actions">
            <button
              className="crm-dp-btn btn-warning"
              onClick={() => navigate(`/crm-driver-location/${id}`)}
            >
              Live Location
            </button>
            <button
              className="crm-dp-btn btn-info"
              onClick={() => navigate(`/crm-driver-profile-edit/${id}`)}
            >
              Edit Driver
            </button>
            <button
              className="crm-dp-btn btn-warning"
              onClick={() => navigate(`/crm-driver-referral-list/${id}`)}
            >
              Referral List
            </button>
            <button
              className="crm-dp-btn btn-warning"
              onClick={() => navigate(`/crm-driver-referral-commission-list/${id}`)}
            >
              Referral Commission
            </button>

            {/* Approval / Rejection Controls */}
            {(!isApproved || isRejected) && (
              <button
                className="crm-dp-btn btn-success"
                onClick={handleApprove}
                disabled={submittingStatus}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <Check size={16} /> Approve Driver
              </button>
            )}

            {(!isRejected || isApproved) && (
              <button
                className="crm-dp-btn btn-danger"
                onClick={handleReject}
                disabled={submittingStatus}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <X size={16} /> Reject Driver
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="crm-driverprofile-body">
          <table className="crm-driverprofile-table">
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <th className="crm-dp-label">{r.label}</th>
                  <td className="crm-dp-value">{r.value}</td>
                </tr>
              ))}

              {/* Document Images */}
              {imageRows.map((img, i) => {
                if (!img.src) return null;
                return (
                  <tr key={"img-" + i}>
                    <th className="crm-dp-label">{img.label}</th>
                    <td className="crm-dp-value">
                      <img
                        src={img.src}
                        alt={img.label}
                        className="crm-dp-doc-thumb"
                        onClick={() => setZoomImage(img.src)}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Enlarged Document"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px", objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
