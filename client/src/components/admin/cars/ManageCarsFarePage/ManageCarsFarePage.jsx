import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../carsTable.css";

export default function ManageCarsFarePage() {
  const navigate = useNavigate();
  const [fares, setFares] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // form fields
  const [vehicleType, setVehicleType] = useState("");
  const [farePerKm, setFarePerKm] = useState("");
  const [farePerKmTo, setFarePerKmTo] = useState("");
  const [outStationAboveKm, setOutStationAboveKm] = useState("");
  const [outStationAbovePrice, setOutStationAbovePrice] = useState("");
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [fareRes, typeRes] = await Promise.all([
        api.get("/cars/fares"),
        api.get("/cars/types"),
      ]);
      if (fareRes.data && fareRes.data.fares) setFares(fareRes.data.fares);
      if (typeRes.data && typeRes.data.types) setVehicleTypes(typeRes.data.types);
    } catch (err) {
      console.error("Failed to load fare data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!vehicleType) {
      showErrorAlert("Please select a vehicle type");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("vehicleType", vehicleType);
      formData.append("farePerKm", farePerKm || "0.00");
      if (farePerKmTo) formData.append("farePerKmTo", farePerKmTo);
      if (outStationAboveKm) formData.append("outStationAboveKm", outStationAboveKm);
      if (outStationAbovePrice) formData.append("outStationAbovePrice", outStationAbovePrice);
      if (image) formData.append("image", image);

      const res = await api.post("/cars/fares", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data && res.data.success) {
        showSuccessAlert("Fare rule saved successfully!");
        setVehicleType("");
        setFarePerKm("");
        setFarePerKmTo("");
        setOutStationAboveKm("");
        setOutStationAbovePrice("");
        setImage(null);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save fare:", err);
      showErrorAlert(err.response?.data?.message || "Failed to save fare rule");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/cars/fare/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this fare rule!",
      deletedText: "Fare rule has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/cars/fares/${id}`);
          setFares((prev) => prev.filter((f) => f.id !== id && f._id !== id));
          showSuccessAlert("Fare rule deleted successfully!");
        } catch (err) {
          console.error("Failed to delete fare rule:", err);
          showErrorAlert("Failed to delete fare rule");
        }
      },
    });
  }

  const filteredFares = fares.filter((f) =>
    (f.vehicleTypeName || f.vehicleType || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFares.length / pageSize) || 1;
  const paginatedFares = filteredFares.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="cars-page-wrap">
      {/* Add Fare Per KM */}
      <div className="cars-card">
        <div className="cars-card-header">
          <h4 className="cars-card-title">Add Fare Per KM</h4>
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
                <label>Fare Per KM (₹)</label>
                <input
                  type="text"
                  placeholder="Enter Fare Per Km (₹)"
                  value={farePerKm}
                  onChange={(e) => setFarePerKm(e.target.value)}
                  required
                />
              </div>

              <div className="cars-form-group">
                <label>Fare Per KM To (₹)</label>
                <input
                  type="text"
                  placeholder="Enter Fare Per Km to Price (₹)"
                  value={farePerKmTo}
                  onChange={(e) => setFarePerKmTo(e.target.value)}
                />
              </div>

              <div className="cars-form-group">
                <label>Out Station Above Distance (KM)</label>
                <input
                  type="text"
                  placeholder="Enter Out station above Distance (KM)"
                  value={outStationAboveKm}
                  onChange={(e) => setOutStationAboveKm(e.target.value)}
                />
              </div>

              <div className="cars-form-group">
                <label>Out Station Above Price (₹)</label>
                <input
                  type="text"
                  placeholder="Enter Out station above KM"
                  value={outStationAbovePrice}
                  onChange={(e) => setOutStationAbovePrice(e.target.value)}
                />
              </div>

              <div className="cars-form-group">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImage(e.target.files[0])}
                />
              </div>
            </div>

            <button
              type="submit"
              className="cars-save-btn cars-save-btn-margin"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>

      {/* Added Fare table */}
      <div className="cars-card">
        <div className="cars-card-header">
          <h4 className="cars-card-title">Added Fare</h4>
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
                  <th>Fare Per KM (₹)</th>
                  <th>Fare Per KM To (₹)</th>
                  <th>O/S Above Distance (km)</th>
                  <th>O/S Above Price</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="cars-no-data">
                      Loading fares...
                    </td>
                  </tr>
                ) : paginatedFares.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="cars-no-data">
                      No fares found
                    </td>
                  </tr>
                ) : (
                  paginatedFares.map((f, i) => (
                    <tr key={f.id || f._id}>
                      <td>{(currentPage - 1) * pageSize + i + 1}</td>
                      <td>{f.vehicleTypeName}</td>
                      <td>{f.farePerKm}</td>
                      <td>{f.farePerKmTo}</td>
                      <td>{f.osAboveDistance}</td>
                      <td>{f.osAbovePrice}</td>
                      <td>
                        <img src={f.image} alt="" className="cars-table-thumb" />
                      </td>
                      <td>
                        <div className="cars-action-icons">
                          <button
                            className="cars-icon-btn edit"
                            onClick={() => handleEdit(f.id || f._id)}
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="cars-icon-btn delete"
                            onClick={() => handleDelete(f.id || f._id)}
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
