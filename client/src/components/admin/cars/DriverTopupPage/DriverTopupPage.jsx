import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../carsTable.css";

export default function DriverTopupPage() {
  const navigate = useNavigate();
  const [topups, setTopups] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // form fields
  const [vehicleType, setVehicleType] = useState("");
  const [topupAmount, setTopupAmount] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [aboveDistance, setAboveDistance] = useState("");
  const [extraCharge, setExtraCharge] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [topupRes, typeRes] = await Promise.all([
        api.get("/cars/topups"),
        api.get("/cars/types"),
      ]);
      if (topupRes.data && topupRes.data.topups) setTopups(topupRes.data.topups);
      if (typeRes.data && typeRes.data.types) setVehicleTypes(typeRes.data.types);
    } catch (err) {
      console.error("Failed to load driver topup data:", err);
    } finally {
      setLoading(false);
    }
  }

  function slabsValue(amount) {
    const val = Number(amount || 0);
    return val > 0 ? `${val * 7}` : "";
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!vehicleType) {
      showErrorAlert("Please select a vehicle type");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        carTypeId: Number(vehicleType),
        topupAmount: Number(topupAmount || 0),
        slabs: slabsValue(topupAmount),
        timeLimit: timeLimit || "720",
        aboveDistance: aboveDistance || "25",
        extraCharge: extraCharge || "12",
      };

      const res = await api.post("/cars/topups", payload);
      if (res.data && res.data.success) {
        showSuccessAlert("Driver topup pack saved successfully!");
        setVehicleType("");
        setTopupAmount("");
        setTimeLimit("");
        setAboveDistance("");
        setExtraCharge("");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save driver topup:", err);
      showErrorAlert(err.response?.data?.message || "Failed to save driver topup pack");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/cars/topup/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this driver topup pack!",
      deletedText: "Driver topup pack has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/cars/topups/${id}`);
          setTopups((prev) => prev.filter((t) => t.id !== id && t._id !== id));
          showSuccessAlert("Driver topup pack deleted successfully!");
        } catch (err) {
          console.error("Failed to delete driver topup:", err);
          showErrorAlert("Failed to delete driver topup pack");
        }
      },
    });
  }

  const filteredTopups = topups.filter((t) =>
    (t.vehicleType || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTopups.length / pageSize) || 1;
  const paginatedTopups = filteredTopups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="cars-page-wrap">
      {/* Add Driver Topup */}
      <div className="cars-card">
        <div className="cars-card-header">
          <h4 className="cars-card-title">Add Driver Topup</h4>
        </div>
        <div className="cars-card-body">
          <form onSubmit={handleSave}>
            <div className="cars-form-grid">
              <div className="cars-form-group">
                <label>Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map((v) => (
                    <option key={v.id || v._id} value={v.id || v.mysqlId || v._id}>
                      {v.name || v.typeName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cars-form-group">
                <label>Topup Amount</label>
                <input
                  type="number"
                  placeholder="Enter Topup Amount in inr"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                />
              </div>

              <div className="cars-form-group">
                <label>Time Limit (in minutes)</label>
                <input
                  type="number"
                  placeholder="Enter Time Limit in minutes"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                />
              </div>

              <div className="cars-form-group">
                <label>Above Distance (in km)</label>
                <input
                  type="number"
                  placeholder="Enter Above Distance KM"
                  value={aboveDistance}
                  onChange={(e) => setAboveDistance(e.target.value)}
                />
              </div>

              <div className="cars-form-group">
                <label>Extra Charge</label>
                <input
                  type="number"
                  placeholder="Enter Extra Charge in percentage"
                  value={extraCharge}
                  onChange={(e) => setExtraCharge(e.target.value)}
                />
              </div>

              <div className="cars-form-group cars-form-group-btn">
                <button type="submit" className="cars-save-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Driver Topup"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Manage Vehicle Types table */}
      <div className="cars-card">
        <div className="cars-card-header">
          <h4 className="cars-card-title">Manage Vehicle Types</h4>
        </div>
        <div className="cars-card-body">
          <div className="cars-table-toolbar">
            <input
              type="search"
              className="cars-table-search"
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="cars-table-wrap">
            <table className="cars-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Vehicle Type</th>
                  <th>Topup Amount</th>
                  <th>Slabs</th>
                  <th>Time Limit (minimum minutes)</th>
                  <th>Above Distance (km)</th>
                  <th>Extra Charge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="cars-no-data">
                      Loading driver topups...
                    </td>
                  </tr>
                ) : paginatedTopups.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="cars-no-data">
                      No driver topups found
                    </td>
                  </tr>
                ) : (
                  paginatedTopups.map((t, i) => (
                    <tr key={t.id || t._id}>
                      <td>{(currentPage - 1) * pageSize + i + 1}</td>
                      <td>{t.vehicleType}</td>
                      <td>{t.topupAmount}</td>
                      <td>{t.slabs}</td>
                      <td>{t.timeLimit}</td>
                      <td>{t.aboveDistance}</td>
                      <td>{t.extraCharge}</td>
                      <td>
                        <div className="cars-action-icons">
                          <button
                            className="cars-icon-btn edit"
                            onClick={() => handleEdit(t.id || t._id)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="cars-icon-btn delete"
                            onClick={() => handleDelete(t.id || t._id)}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
