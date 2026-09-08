import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Eye } from "lucide-react";
import { swalWithBootstrapButtons } from "../../../utils/sweetAlert";
import Pagination from "../../admin/rides/Pagination/Pagination";
import "./CrmManageDrivers.css";

const mockDriversList = [
  {
    id: 13878,
    srNo: 1,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/edfa16e5-b8ca-4cea-be6c-670fbd4ae2dd.jpg",
    name: "Harvinder Singh",
    email: "harnoorkaur0085@gmail.com",
    phone: "+919855897719",
    activeStatus: "Offline",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13852,
    srNo: 2,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/b0483cb9-6daa-4d45-aa08-cde840b986dd.jpg",
    name: "Rahul",
    email: "rahulcandy155@gmail.com",
    phone: "+918685896408",
    activeStatus: "Offline",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13848,
    srNo: 3,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/978f68ec-a3e3-4294-8851-123b210677ed.jpg",
    name: "kuldeep",
    email: "knehra202@gmail.com",
    phone: "+917404046446",
    activeStatus: "Online",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13828,
    srNo: 4,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/645c1fb2-8ddd-4861-a4d5-8501ab4e11aa.jpg",
    name: "rohit",
    email: "rm6543171@gmail.com",
    phone: "+918950038024",
    activeStatus: "Online",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13824,
    srNo: 5,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/118b255a-bb34-4412-988c-d569b29bca04.jpg",
    name: "Gurpreet singh",
    email: "gbrar5219@gmail.com",
    phone: "+919772528300",
    activeStatus: "Online",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13821,
    srNo: 6,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/f378db5a-9ece-49d9-8d4a-db5d197e13c1.jpg",
    name: "Mohinder Pal",
    email: "rk2785109@gmail.com",
    phone: "+918303027895",
    activeStatus: "Online",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13816,
    srNo: 7,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/94bfc15c-e442-43c3-80d5-d8a31a25bcc4.jpg",
    name: "Jeet Singh",
    email: "Jeetsingh0509@gmail.com",
    phone: "+918219543510",
    activeStatus: "Offline",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13815,
    srNo: 8,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/93806b41-7450-4edf-b55d-0e95e4c6d892.jpg",
    name: "Gurmail Singh",
    email: "gurmailsingh2026@gmail.com",
    phone: "+916239345514",
    activeStatus: "Offline",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13813,
    srNo: 9,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/7fec7e14-048b-405c-9152-687576b838ca.jpg",
    name: "Arvind Kumar Dogra",
    email: "dograa19@gmail.com",
    phone: "+919736320205",
    activeStatus: "Offline",
    blocked: false,
    status: "Approved",
  },
  {
    id: 13811,
    srNo: 10,
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/driver_image/612b7863-9e96-4025-914b-2643c109b456.jpg",
    name: "avdhesh Kumar Prajapati",
    email: "kumaravdhesh49@gmail.com",
    phone: "+916284398018",
    activeStatus: "Offline",
    blocked: false,
    status: "Pending",
  },
];

export default function CrmManageDrivers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState(mockDriversList);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 153;

  function handleSearch(e) {
    e.preventDefault();
    if (!search.trim()) {
      setDrivers(mockDriversList);
      return;
    }
    const q = search.toLowerCase();
    const filtered = mockDriversList.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.phone.toLowerCase().includes(q) ||
        d.activeStatus.toLowerCase().includes(q) ||
        String(d.id).includes(q)
    );
    setDrivers(filtered);
  }

  function handleReload() {
    setLoading(true);
    setSearch("");
    setDrivers([...mockDriversList]);
    setTimeout(() => setLoading(false), 400);
  }

  function handleBlockToggle(id) {
    swalWithBootstrapButtons.fire({
      title: "Change Block Status?",
      text: "Are you sure you want to change the block status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change status",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === id ? { ...d, blocked: !d.blocked } : d))
        );
        swalWithBootstrapButtons.fire({
          title: "Status Updated!",
          text: "Driver block status has been updated.",
          icon: "success",
        });
      }
    });
  }

  function handleView(id) {
    navigate(`/crm-driver-profile/${id}`);
  }

  return (
    <div className="crm-managedrivers-page-wrap">
      <div className="crm-managedrivers-card">
        <div className="crm-managedrivers-card-header">
          <h4 className="crm-managedrivers-card-title">Manage Driver</h4>
        </div>

        <div className="crm-managedrivers-card-body">
          {/* Top Filter Bar */}
          <div className="crm-managedrivers-filter-bar">
            <form className="crm-managedrivers-search-form" onSubmit={handleSearch}>
              <div className="crm-managedrivers-input-group">
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="crm-managedrivers-search-btn">
                  <Search size={14} /> Search
                </button>
              </div>
            </form>

            <button
              type="button"
              className="crm-managedrivers-reload-btn"
              onClick={handleReload}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Reload</span>
            </button>
          </div>

          {/* Table */}
          <div className="crm-managedrivers-table-wrap">
            <table className="crm-managedrivers-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>Sr.no</th>
                  <th>Driver Image</th>
                  <th>Name</th>
                  <th>Email</th>
                  {/* <th>Phone no.</th> */}
                  <th style={{ textAlign: "center" }}>Active Status</th>
                  <th style={{ textAlign: "center" }}>Block Status</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ width: "100px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="crm-managedrivers-no-data">
                      No drivers found
                    </td>
                  </tr>
                ) : (
                  drivers.map((d, i) => {
                    const isOnline = d.activeStatus === "Online";
                    return (
                      <tr key={d.id}>
                        <td style={{ textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                        <td >
                          <div className="crm-driver-avatar-wrap">
                            <img
                              src={d.image}
                              alt={d.name}
                              className="crm-driver-avatar"
                              onError={(e) => {
                                e.target.src =
                                  "https://kalasalingam.ac.in/wp-content/uploads/2021/08/Achievements-dummy-profile.png";
                              }}
                            />
                          </div>
                        </td>
                        <td className="crm-driver-name">{d.name}</td>
                        <td className="crm-driver-email">{d.email}</td>
                        {/* <td className="crm-driver-phone">{d.phone}</td> */}
                        <td style={{ textAlign: "center" }}>
                          <span className={`crm-driver-active-badge ${isOnline ? "online" : "offline"}`}>
                            {d.activeStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className={`crm-driver-block-btn ${d.blocked ? "unblock" : "block"}`}
                            onClick={() => handleBlockToggle(d.id)}
                          >
                            {d.blocked ? "Unblock" : "Block"}
                          </button>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className="crm-driver-status-approved">
                            {d.status}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            type="button"
                            className="crm-driver-action-eye-btn"
                            title="View Driver Profile"
                            onClick={() => handleView(d.id)}
                          >
                            <Eye size={15} strokeWidth={2.5} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
