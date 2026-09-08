import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Search, Eye, CheckCircle2 } from "lucide-react";
import Pagination from "../../rides/Pagination/Pagination";
import "../../shared/formCard.css";
import "./SubAdminDriversPage.css";

const mockSubAdminDrivers = {
  15: [
    { id: 101, name: "Ramesh Patel", phone: "+91 9825012345", vehicle: "Sedan (GJ-01-AB-1234)", rides: 142, wallet: "₹ 1,450", status: "Active", image: "https://ui-avatars.com/api/?name=Ramesh+Patel&background=2e9e5b&color=fff" },
    { id: 102, name: "Hitesh Shah", phone: "+91 9898012345", vehicle: "Hatchback (GJ-01-XY-5678)", rides: 89, wallet: "₹ 820", status: "Active", image: "https://ui-avatars.com/api/?name=Hitesh+Shah&background=2e9e5b&color=fff" },
    { id: 103, name: "Jignesh Desai", phone: "+91 9724012345", vehicle: "Mini SUV (GJ-05-CD-9012)", rides: 210, wallet: "₹ 2,300", status: "Active", image: "https://ui-avatars.com/api/?name=Jignesh+Desai&background=2e9e5b&color=fff" },
  ],
  default: [
    { id: 201, name: "Vikram Singh", phone: "+91 9414012345", vehicle: "Sedan (MH-02-AA-4321)", rides: 98, wallet: "₹ 1,120", status: "Active", image: "https://ui-avatars.com/api/?name=Vikram+Singh&background=2e9e5b&color=fff" },
    { id: 202, name: "Anil Kumar", phone: "+91 9166012345", vehicle: "Hatchback (MH-03-BB-8765)", rides: 45, wallet: "₹ 450", status: "Inactive", image: "https://ui-avatars.com/api/?name=Anil+Kumar&background=e5484d&color=fff" },
  ],
};

const subAdminNames = {
  15: "Gujarat",
  14: "Madhya Pradesh",
  13: "Jharkhand",
  12: "Bihar",
  11: "Maharashtra",
};

export default function SubAdminDriversPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const regionName = subAdminNames[id] || `Sub-Admin #${id}`;
  const driverList = mockSubAdminDrivers[id] || mockSubAdminDrivers.default;

  const filtered = driverList.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search) ||
    d.vehicle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fc-page-wrap">
      <div className="subadmin-drivers-topbar">
        <button className="fc-back-btn" onClick={() => navigate("/admin/subadmin/see")}>
          <ArrowLeft size={16} />
          <span>Back to Sub-Admins</span>
        </button>
      </div>

      <div className="fc-card">
        <div className="fc-card-header">
          <div className="subadmin-drivers-header-info">
            <div className="subadmin-drivers-header-icon">
              <Car size={20} />
            </div>
            <div>
              <h4 className="fc-card-title">Assigned Drivers — {regionName}</h4>
              <p className="subadmin-drivers-subtitle">
                Viewing all active registered drivers managed by Sub-Admin #{id} ({regionName} State)
              </p>
            </div>
          </div>
        </div>

        <div className="fc-card-body">
          <div className="subadmin-drivers-toolbar">
            <div className="subadmin-drivers-search-box">
              <Search size={16} className="subadmin-drivers-search-icon" />
              <input
                type="text"
                placeholder="Search drivers by name, phone or vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="fc-table-wrap">
            <table className="fc-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Driver Profile</th>
                  <th>Driver Name</th>
                  <th>Phone Number</th>
                  <th>Vehicle Info</th>
                  <th>Total Rides</th>
                  <th>Wallet Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="fc-no-data">
                      No assigned drivers found
                    </td>
                  </tr>
                ) : (
                  filtered.map((d, i) => (
                    <tr key={d.id}>
                      <td>{i + 1}</td>
                      <td>
                        <img src={d.image} alt="" className="subadmin-avatar" />
                      </td>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td>{d.phone}</td>
                      <td>{d.vehicle}</td>
                      <td>{d.rides}</td>
                      <td style={{ color: "var(--accent)", fontWeight: 600 }}>{d.wallet}</td>
                      <td>
                        <span className={`subadmin-status-badge ${d.status.toLowerCase()}`}>
                          {d.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="fc-icon-btn edit"
                          title="View Driver Profile"
                          onClick={() => navigate(`/admin/driver/profile/${d.id}`)}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={1}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

