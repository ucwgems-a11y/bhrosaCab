import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./DriverProfilePage.css";

export default function DriverProfilePage() {
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
      console.error("Failed to load driver profile:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Approve Action
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

  // Handle Reject Action
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
      <div className="driverprofile-page-wrap" style={{ textAlign: "center", padding: "50px", color: "var(--text-muted)" }}>
        <h2>Loading Driver Profile...</h2>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="driverprofile-page-wrap" style={{ textAlign: "center", padding: "50px" }}>
        <h2>Driver not found</h2>
        <button
          className="driverprofile-btn orange"
          onClick={() => navigate("/admin/drivers/manage")}
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
    { label: "Driver Name:", value: driver.name + (driver.lastName ? " " + driver.lastName : "") },
    { label: "Phone Number:", value: driver.number || driver.phone || "N/A" },
    { label: "Email Address:", value: driver.email || "N/A" },
    { label: "State / Location:", value: driver.state || "N/A" },
    { label: "Wallet Balance:", value: "₹ " + (driver.wallet || 0).toFixed(2) },
    { label: "License Number:", value: driver.license_number || driver.licenseNumber || "N/A" },
    { label: "Aadhaar Number:", value: driver.aadhaar_number || driver.aadhaarNumber || "N/A" },
    { label: "Aadhaar Status:", value: driver.aadhaar_number_status || driver.aadhaarStatus || "pending" },
    { label: "Licence Status:", value: driver.driving_licence_status || driver.licenceStatus || "pending" },
    { label: "Vehicle Brand:", value: driver.brand || driver.vehicleBrand || "N/A" },
    { label: "Vehicle Model:", value: driver.model || driver.vehicleModel || "N/A" },
    { label: "Vehicle Number:", value: driver.vehicle_number || driver.vehicleNumber || "N/A" },
    { label: "Vehicle Category:", value: driver.cateogory || driver.vehicleCategory || "Hatchback" },
    { label: "Manufacturing Year:", value: driver.manufacturing_year || "N/A" },
    { label: "Application Status:", value: isApproved ? "Approved" : isRejected ? "Rejected" : "Pending" },
  ];

  const imageRows = [
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
    <div className="driverprofile-page-wrap">
      <div className="driverprofile-card">
        <div className="driverprofile-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h2>Driver Details &amp; Documents</h2>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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
        </div>

        <div className="driverprofile-actions-row">
          <button
            className="driverprofile-btn orange"
            onClick={() => navigate(`/admin/drivers/${id}/location`)}
          >
            Driver Live Location
          </button>
          <button
            className="driverprofile-btn purple"
            onClick={() => navigate(`/admin/drivers/${id}/edit`)}
          >
            Edit Driver
          </button>
          <button
            className="driverprofile-btn orange"
            onClick={() => navigate(`/admin/drivers/${id}/referrals`)}
          >
            Referral List
          </button>
          <button
            className="driverprofile-btn purple"
            onClick={() => navigate(`/admin/drivers/${id}/referral-commission`)}
          >
            Referral Commision List
          </button>
          <button
            className="driverprofile-btn orange"
            onClick={() => navigate("/admin/drivers/manage")}
          >
            Back to Drivers List
          </button>
        </div>

        <div className="driverprofile-body">
          <table className="driverprofile-table">
            <tbody>
              <tr>
                <th>Profile Image</th>
                <td>
                  <img
                    src={driver.image}
                    alt="Driver"
                    className="driverprofile-avatar"
                    onClick={() => setZoomImage(driver.image)}
                    onError={(e) => {
                      e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(driver.name);
                    }}
                  />
                </td>
              </tr>
              {rows.map((r) => (
                <tr key={r.label}>
                  <th>{r.label}</th>
                  <td>{r.value}</td>
                </tr>
              ))}
              {imageRows.map((r) => (
                <tr key={r.label}>
                  <th>{r.label}</th>
                  <td>
                    <img
                      src={r.src || "/no-document.png"}
                      alt={r.label}
                      className="driverprofile-doc-thumb"
                      onClick={() => setZoomImage(r.src || "/no-document.png")}
                      style={{
                        cursor: "pointer",
                        objectFit: "contain",
                        background: r.src ? "transparent" : "#ffffff",
                        padding: r.src ? "0" : "4px",
                      }}
                      onError={(e) => {
                        e.target.src = "/no-document.png";
                        e.target.style.background = "#ffffff";
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom Action Approval/Rejection Section - HIDE WHEN DRIVER IS APPROVED */}
          {!isApproved && (
            <div
              style={{
                marginTop: "28px",
                padding: "20px",
                background: "var(--bg-panel, #1e293b)",
                borderRadius: "12px",
                border: "1px solid var(--border-color, #334155)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary, #fff)" }}>
                  Verification Actions
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted, #94a3b8)" }}>
                  {isRejected
                    ? "This driver is currently REJECTED. Review documents and click Approve to activate."
                    : "This driver is currently PENDING approval. Review submitted documents and approve or reject below."}
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submittingStatus}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#10b981",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 22px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    opacity: submittingStatus ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Check size={18} />
                  <span>Approve Driver</span>
                </button>

                <button
                  type="button"
                  onClick={handleReject}
                  disabled={submittingStatus || isRejected}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: isRejected ? "#dc2626" : "#ef4444",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 22px",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: isRejected ? "default" : "pointer",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                    opacity: submittingStatus ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <X size={18} />
                  <span>{isRejected ? "Rejected ✗" : "Reject Driver"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {zoomImage && (
        <div className="driverprofile-zoom-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Document Zoom" className="driverprofile-zoom-img" />
        </div>
      )}
    </div>
  );
}
