import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Car, Search, RefreshCw } from "lucide-react";
import axios from "axios";
import { SERVER_URL, API_BASE_URL } from "../../../../config";
import { confirmDelete, showSuccessAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import "../../shared/formCard.css";
import "./SeeSubAdminPage.css";

const fallbackSubAdmins = [
  {
    id: 19,
    name: "Amar Bhrosa",
    email: "amar@bhrosacab.com",
    phone: "+91 6280048453",
    ip: "43.228.220.73",
    totalDrivers: 0,
    minimumMg: "50000.00",
    agreementUrl: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/agreement/dfcf3c1a-38cf-432a-b8c1-9d6a1468873d.pdf",
    status: "Inactive",
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/userImage/6062d0da-60ff-4a2a-8f63-515ed32224e8.png",
  },
  {
    id: 15,
    name: "Gujrat",
    email: "founder@bhrosacab.com",
    phone: "+91 9876467670",
    ip: "43.228.220.73",
    totalDrivers: 708,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://ui-avatars.com/api/?name=Gujrat&background=0D8ABC&color=fff",
  },
  {
    id: 14,
    name: "Madhya Pradesh",
    email: "founder@bhrosacab.com",
    phone: "+91 9876467670",
    ip: "43.228.220.73",
    totalDrivers: 3,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://ui-avatars.com/api/?name=Madhya+Pradesh&background=0D8ABC&color=fff",
  },
  {
    id: 13,
    name: "Jharkhand",
    email: "bhrosahelpdesk@gmail.com",
    phone: "+91 9876467670",
    ip: "223.181.19.169",
    totalDrivers: 21,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://bhrosacab.com/uploads/userImage/eace94ce-e3fd-48ac-a710-7665bf570d6e.png",
  },
  {
    id: 12,
    name: "Bihar",
    email: "director@bhrosacab.com",
    phone: "+91 7039000037",
    ip: "223.181.19.169",
    totalDrivers: 45,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://bhrosacab.com/uploads/userImage/f26c1bc0-751d-4275-bbe7-5039d9c1ab32.png",
  },
  {
    id: 11,
    name: "Maharashtra User",
    email: "founder@bhrosacab.com",
    phone: "+91 9876467670",
    ip: "202.134.159.6",
    totalDrivers: 756,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://bhrosacab.com/uploads/userImage/c1503f9d-1c73-444d-bd23-26a08a24c17f.png",
  },
  {
    id: 9,
    name: "User Himachal",
    email: "userhimachal@gmail.com",
    phone: "+91 9671007373",
    ip: "223.178.218.156",
    totalDrivers: 10,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://bhrosacab.com/uploads/userImage/2a75257b-1529-423d-a193-623a8d7d5003.png",
  },
  {
    id: 8,
    name: "User Chandigarh",
    email: "userchandigarh@gmail.com",
    phone: "+91 9855983555",
    ip: "223.178.223.111",
    totalDrivers: 1522,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://bhrosacab.com/uploads/userImage/d44f0cfb-b71c-4f7e-8174-80829b21e6f6.png",
  },
  {
    id: 7,
    name: "User Delhi",
    email: "userdelhi@gmail.com",
    phone: "+91 9813119095",
    ip: "103.215.251.78",
    totalDrivers: 1911,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://bhrosacab.com/uploads/userImage/84c1595b-354b-49e6-b270-35b25bf10746.png",
  },
  {
    id: 6,
    name: "User Punjab",
    email: "userpunjab@gmail.com",
    phone: "+91 7876766666",
    ip: "43.228.220.67",
    totalDrivers: 733,
    minimumMg: "N/A",
    agreementUrl: null,
    status: "Inactive",
    image: "https://bhrosacab.com/uploads/userImage/90ead492-b86e-4984-9ba1-4de07dea7ab1.png",
  },
];

export default function SeeSubAdminPage() {
  const navigate = useNavigate();
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function fetchSubAdmins() {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/subadmins`);
      if (res.data && res.data.subAdmins && res.data.subAdmins.length > 0) {
        const formatted = res.data.subAdmins.map((s, idx) => ({
          id: s._id || s.id,
          name: s.name,
          email: s.email,
          phone: s.phone ? (s.countryCode ? `${s.countryCode} ${s.phone}` : s.phone) : "-",
          ip: s.ipAddress || "All IPs",
          totalDrivers: s.totalDrivers || 0,
          minimumMg: s.minimumMG ? Number(s.minimumMG).toFixed(2) : "N/A",
          agreementUrl: s.agreement
            ? (s.agreement.startsWith("http") ? s.agreement : `${SERVER_URL}${s.agreement.startsWith("/") ? "" : "/"}${s.agreement}`)
            : null,
          status: s.status ? "Active" : "Inactive",
          image: s.profileImage
            ? (s.profileImage.startsWith("http")
                ? s.profileImage
                : `${SERVER_URL}${s.profileImage.startsWith("/") ? "" : "/"}${s.profileImage}`)
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || "SubAdmin")}&background=0D8ABC&color=fff`,
        }));
        setSubAdmins(formatted);
      } else {
        setSubAdmins(fallbackSubAdmins);
      }
    } catch (err) {
      console.log("Using fallback subadmins:", err.message);
      setSubAdmins(fallbackSubAdmins);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
  }

  function handleReset() {
    setSearch("");
    setCurrentPage(1);
    fetchSubAdmins();
  }

  function handleEdit(id) {
    navigate(`/admin/subadmin/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "Are you sure to delete this sub-admin?",
      deletedText: "Sub-admin has been removed.",
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/subadmins/${id}`);
        } catch (err) {
          console.log("Delete note:", err.message);
        }
        setSubAdmins((prev) => prev.filter((s) => s.id !== id));
      },
    });
  }

  async function handleToggleStatus(id) {
    try {
      const res = await axios.patch(`${API_BASE_URL}/subadmins/${id}/toggle-status`);
      setSubAdmins((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
            : s
        )
      );
      showSuccessAlert(res.data?.message || "Status updated", 1000);
    } catch (err) {
      // Toggle locally if offline
      setSubAdmins((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, status: s.status === "Active" ? "Inactive" : "Active" }
            : s
        )
      );
    }
  }

  function handleViewDrivers(id) {
    navigate(`/admin/subadmin/${id}/drivers`);
  }

  const filteredSubAdmins = subAdmins.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.ip.includes(search)
  );

  const totalPages = Math.ceil(filteredSubAdmins.length / itemsPerPage) || 1;
  const paginatedData = filteredSubAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fc-page-wrap">
      <div className="fc-card">
        <div className="fc-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h4 className="fc-card-title">Sub-Admins List</h4>
          <button
            className="fc-icon-btn edit"
            title="Refresh List"
            onClick={fetchSubAdmins}
            style={{ width: "32px", height: "32px", borderRadius: "8px" }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
        <div className="fc-card-body">
          <form className="subadmin-search-row" onSubmit={handleSearch}>
            <input
              type="text"
              className="subadmin-search-input"
              placeholder="Search by Name / Email / Phone / IP"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="subadmin-search-btn">
              <Search size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} /> Search
            </button>
            <button
              type="button"
              className="subadmin-reset-btn"
              onClick={handleReset}
              disabled={loading}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Reset</span>
            </button>
          </form>

          <div className="fc-table-wrap">
            <table className="fc-table" id="subAdminTable">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Profile</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>IP Status</th>
                  <th>Total Drivers</th>
                  <th>Minimun MG</th>
                  <th>Agreement</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="fc-no-data">
                      {loading ? "Loading Sub-Admins..." : "No sub-admins found"}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((s, i) => (
                    <tr key={s.id}>
                      <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td>
                        <img
                          src={s.image}
                          alt="Profile"
                          className="subadmin-avatar"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name || "SubAdmin")}&background=0D8ABC&color=fff`;
                          }}
                        />
                      </td>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.phone}</td>
                      <td>{s.ip}</td>
                      <td>{s.totalDrivers}</td>
                      <td>{s.minimumMg || "N/A"}</td>
                      <td>
                        {s.agreementUrl ? (
                          <a
                            href={s.agreementUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="subadmin-agreement-badge"
                          >
                            View
                          </a>
                        ) : (
                          <span>N/A</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(s.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          title="Click to toggle Status"
                        >
                          <span
                            className={`subadmin-status-badge ${s.status.toLowerCase()}`}
                          >
                            {s.status}
                          </span>
                        </button>
                      </td>
                      <td>
                        <div className="fc-action-icons">
                          <button
                            className="fc-icon-btn edit"
                            title="Edit"
                            onClick={() => handleEdit(s.id)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="fc-icon-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            className="fc-icon-btn edit"
                            title="View Drivers List"
                            onClick={() => handleViewDrivers(s.id)}
                          >
                            <Car size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted, #64748b)" }}>
              Showing <span style={{ fontWeight: 600 }}>{filteredSubAdmins.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span style={{ fontWeight: 600 }}>{Math.min(currentPage * itemsPerPage, filteredSubAdmins.length)}</span> of <span style={{ fontWeight: 600 }}>{filteredSubAdmins.length}</span> results
            </p>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
