import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, X, Upload } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../driverTable.css";

export default function DriverVerificationPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null);

  useEffect(() => {
    fetchVerifications(1, activeSearch);
  }, []);

  async function fetchVerifications(page = 1, query = activeSearch) {
    setLoading(true);
    try {
      let url = `/drivers?page=${page}&limit=20`;
      if (query && query.trim()) url += `&search=${encodeURIComponent(query.trim())}`;

      const res = await api.get(url);
      if (res.data && res.data.drivers) {
        setDrivers(res.data.drivers);
        setTotalPages(res.data.totalPages || 1);
        setCurrentPage(res.data.currentPage || 1);
        setTotalRecords(res.data.total || res.data.drivers.length);
      }
    } catch (err) {
      console.error("Failed to load driver verifications:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setActiveSearch(searchInput);
    fetchVerifications(1, searchInput);
  }

  function handleReset() {
    setSearchInput("");
    setActiveSearch("");
    fetchVerifications(1, "");
  }

  function handleAccept(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Approve Driver Documents?",
        text: "Are you sure you want to approve this driver's submitted documents?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, approve!",
        cancelButtonText: "No, cancel",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.put(`/drivers/${id}/status`, {
              status: 2,
              document_verify_status: "accepted",
              driving_licence_status: "approved",
              aadhaar_number_status: "approved",
            });
            showSuccessAlert("Driver documents approved successfully!");
            fetchVerifications(currentPage, activeSearch);
          } catch (err) {
            console.error("Failed to approve driver:", err);
            showErrorAlert("Failed to approve driver");
          }
        }
      });
  }

  function handleReject(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Reject Driver Documents?",
        text: "Are you sure you want to reject this driver's submitted documents?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, reject!",
        cancelButtonText: "No, cancel",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.put(`/drivers/${id}/status`, {
              status: 3,
              document_verify_status: "rejected",
              driving_licence_status: "rejected",
              aadhaar_number_status: "rejected",
            });
            showSuccessAlert("Driver documents have been rejected.");
            fetchVerifications(currentPage, activeSearch);
          } catch (err) {
            console.error("Failed to reject driver:", err);
            showErrorAlert("Failed to reject driver");
          }
        }
      });
  }

  function handleReupload(id) {
    navigate(`/admin/drivers/reupload/${id}`);
  }

  function renderDocThumbnail(src, alt = "Doc") {
    const finalSrc = src || "/no-document.png";
    return (
      <img
        src={finalSrc}
        alt={alt}
        className="driver-doc-thumbnail"
        style={{
          objectFit: "contain",
          background: src ? "transparent" : "#ffffff",
          padding: src ? "0" : "2px",
          cursor: "pointer",
        }}
        onClick={() => setZoomedImage({ src: finalSrc, title: alt })}
        title="Click to zoom document"
        onError={(e) => {
          e.target.src = "/no-document.png";
          e.target.style.background = "#ffffff";
        }}
      />
    );
  }

  return (
    <div className="driver-page-container">
      {/* 1. Header Title */}
      <h1 className="driver-main-title" style={{ marginBottom: "20px" }}>
        Driver Document Verification
      </h1>

      {/* 2. Controls Toolbar */}
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by Name / Email / Phone"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="driver-standalone-search-input"
          />
          <button type="submit" className="driver-btn-rounded-primary">
            <Search size={15} />
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={handleReset}
          className="driver-btn-rounded-secondary"
        >
          Reset
        </button>
      </div>

      {/* 3. Table Card Wrap */}
      <div className="driver-card-wrap">
        <div className="driver-table-responsive">
          <table className="driver-custom-table">
            <thead>
              <tr>
                <th>Sr.no</th>
                <th>Driver Image</th>
                <th>Name</th>
                <th>Phone no.</th>
                <th>Vehicle Front Image</th>
                <th>Vehicle Back Image</th>
                <th>Driving Licence Front Image</th>
                <th>Driving Licence Status</th>
                <th>Aadhaar Number</th>
                <th>Aadhaar Number Status</th>
                <th>Id Proof Front Image</th>
                <th>Id Proof Back Image</th>
                <th>Vehicle RC Front Image</th>
                <th>Vehicle RC Back Image</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={16} className="driver-no-data-cell">
                    Loading driver verifications...
                  </td>
                </tr>
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan={16} className="driver-no-data-cell">
                    No drivers found
                  </td>
                </tr>
              ) : (
                drivers.map((d, index) => {
                  const isApproved = d.status === "Approved" || d.statusCode === 2;
                  const isRejected = d.status === "Rejected" || d.statusCode === 3;

                  return (
                    <tr key={d.id || d._id}>
                      <td>{(currentPage - 1) * 20 + index + 1}</td>
                      <td>
                        <img
                          src={d.image}
                          alt={d.name}
                          className="driver-avatar-img"
                          onError={(e) => {
                            e.target.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(d.name);
                          }}
                        />
                      </td>
                      <td>{d.name}</td>
                      <td>{d.phone}</td>
                      <td>{renderDocThumbnail(d.vehicleFront, "Vehicle Front")}</td>
                      <td>{renderDocThumbnail(d.vehicleBack, "Vehicle Back")}</td>
                      <td>{renderDocThumbnail(d.licenceFront, "Licence Front")}</td>
                      <td>
                        <span
                          className={
                            d.licenceStatus === "approved"
                              ? "driver-status-text approved"
                              : d.licenceStatus === "rejected"
                              ? "driver-status-text rejected"
                              : "driver-status-text pending"
                          }
                        >
                          {d.licenceStatus || "pending"}
                        </span>
                      </td>
                      <td>{d.aadhaarNumber}</td>
                      <td>
                        <span
                          className={
                            d.aadhaarStatus === "approved"
                              ? "driver-status-text approved"
                              : d.aadhaarStatus === "rejected"
                              ? "driver-status-text rejected"
                              : "driver-status-text pending"
                          }
                        >
                          {d.aadhaarStatus || "pending"}
                        </span>
                      </td>
                      <td>{renderDocThumbnail(d.idProofFront, "ID Front")}</td>
                      <td>{renderDocThumbnail(d.idProofBack, "ID Back")}</td>
                      <td>{renderDocThumbnail(d.rcFront, "RC Front")}</td>
                      <td>{renderDocThumbnail(d.rcBack, "RC Back")}</td>
                      <td>
                        <span
                          className={
                            isApproved
                              ? "driver-status-text approved"
                              : isRejected
                              ? "driver-status-text rejected"
                              : "driver-status-text pending"
                          }
                        >
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <div className="driver-action-icons-wrap" style={{ gap: "6px" }}>
                          {/* Reject Icon - Hide if already Rejected */}
                          {!isRejected && (
                            <button
                              type="button"
                              className="driver-circle-btn reject"
                              onClick={() => handleReject(d.id || d._id)}
                              title="Reject Documents"
                            >
                              <X size={14} />
                            </button>
                          )}

                          {/* Re-upload Icon - Always available */}
                          <button
                            type="button"
                            className="driver-circle-btn reupload"
                            onClick={() => handleReupload(d.id || d._id)}
                            title="Re-upload Documents"
                          >
                            <Upload size={14} />
                          </button>

                          {/* Approve Icon - Show on Pending or when documents are freshly re-uploaded */}
                          {!isApproved && !isRejected && (
                            <button
                              type="button"
                              className="driver-circle-btn approve"
                              onClick={() => handleAccept(d.id || d._id)}
                              title="Approve Documents"
                            >
                              <Check size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 4px" }}>
        <span style={{ color: "var(--text-muted, #94a3b8)", fontSize: "13px" }}>
          Showing {drivers.length} of {totalRecords} records (Page {currentPage} of {totalPages})
        </span>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => fetchVerifications(p, activeSearch)}
        />
      </div>

      {/* Document Image Zoom Modal - Only for documents */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "zoom-out",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "var(--bg-card, #1c202a)",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid var(--border-color, rgba(255, 255, 255, 0.1))",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "12px" }}>
              <span style={{ color: "var(--text-primary, #ffffff)", fontSize: "15px", fontWeight: 700 }}>
                {zoomedImage.title}
              </span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted, #94a3b8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "4px",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={zoomedImage.src}
              alt={zoomedImage.title}
              style={{
                maxWidth: "80vw",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: "6px",
                background: "#ffffff",
              }}
            />
            <span style={{ color: "var(--text-muted, #94a3b8)", marginTop: "10px", fontSize: "12px" }}>
              Click anywhere outside or close icon to dismiss
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
