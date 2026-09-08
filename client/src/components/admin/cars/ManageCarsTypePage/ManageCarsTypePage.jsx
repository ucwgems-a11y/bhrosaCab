import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete, showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import Pagination from "../../rides/Pagination/Pagination";
import api from "../../../../api/axios";
import "../carsTable.css";

export default function ManageCarsTypePage() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTypeName, setNewTypeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTypes();
  }, []);

  async function fetchTypes() {
    setLoading(true);
    try {
      const res = await api.get("/cars/types");
      if (res.data && res.data.types) {
        setTypes(res.data.types);
      }
    } catch (err) {
      console.error("Failed to load vehicle types:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!newTypeName.trim()) return;
    setSaving(true);
    try {
      const res = await api.post("/cars/types", { typeName: newTypeName.trim() });
      if (res.data && res.data.success) {
        showSuccessAlert("Vehicle type added successfully!");
        setNewTypeName("");
        fetchTypes();
      }
    } catch (err) {
      console.error("Failed to create vehicle type:", err);
      showErrorAlert(err.response?.data?.message || "Failed to add vehicle type");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(id) {
    navigate(`/admin/cars/type/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this vehicle category!",
      deletedText: "Vehicle type has been deleted.",
      onConfirm: async () => {
        try {
          await api.delete(`/cars/types/${id}`);
          setTypes((prev) => prev.filter((t) => t.id !== id && t._id !== id));
          showSuccessAlert("Vehicle type deleted successfully!");
        } catch (err) {
          console.error("Failed to delete vehicle type:", err);
          showErrorAlert("Failed to delete vehicle type");
        }
      },
    });
  }

  const filteredTypes = types.filter((t) =>
    (t.name || t.typeName || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTypes.length / pageSize) || 1;
  const paginatedTypes = filteredTypes.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="cars-page-wrap">
      {/* Add Vehicle Type */}
      <div className="cars-card">
        <div className="cars-card-header">
          <h4 className="cars-card-title">Add Vehicle Type</h4>
        </div>
        <div className="cars-card-body">
          <form className="cars-form-row" onSubmit={handleSave}>
            <div className="cars-form-group">
              <label>Vehicle Type Name</label>
              <input
                type="text"
                placeholder="Enter Vehicle Type (e.g. Bike, Sedan)"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="cars-save-btn" disabled={saving}>
              {saving ? "Saving..." : "Save Vehicle Type"}
            </button>
          </form>
        </div>
      </div>

      {/* Manage Vehicle Types */}
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="cars-no-data">
                      Loading vehicle types...
                    </td>
                  </tr>
                ) : paginatedTypes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="cars-no-data">
                      No vehicle types found
                    </td>
                  </tr>
                ) : (
                  paginatedTypes.map((t, i) => (
                    <tr key={t.id || t._id}>
                      <td>{(currentPage - 1) * pageSize + i + 1}</td>
                      <td>{t.name || t.typeName}</td>
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
