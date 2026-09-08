import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, CheckCircle2 } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "./EditDriverTopupPage.css";

export default function EditDriverTopupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleType, setVehicleType] = useState("");
  const [topupAmount, setTopupAmount] = useState("");
  const [slabs, setSlabs] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [aboveDistance, setAboveDistance] = useState("");
  const [extraCharge, setExtraCharge] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [typeRes, topupRes] = await Promise.all([
          api.get("/cars/types"),
          api.get(`/cars/topups/${id}`),
        ]);
        if (typeRes.data && typeRes.data.types) setVehicleTypes(typeRes.data.types);
        if (topupRes.data && topupRes.data.topup) {
          const t = topupRes.data.topup;
          setVehicleType(t.vehicleType);
          setTopupAmount(t.topupAmount || "");
          setSlabs(t.slabs || "");
          setTimeLimit(t.timeLimit || "");
          setAboveDistance(t.aboveDistance || "");
          setExtraCharge(t.extraCharge || "");
        }
      } catch (err) {
        console.error("Failed to load driver topup details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadData();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        carTypeId: Number(vehicleType),
        topupAmount: Number(topupAmount || 0),
        slabs: slabs || null,
        timeLimit: timeLimit || null,
        aboveDistance: aboveDistance || null,
        extraCharge: extraCharge || null,
      };

      const res = await api.put(`/cars/topups/${id}`, payload);
      if (res.data && res.data.success) {
        setShowSuccess(true);
        showSuccessAlert("Your work has been saved", 1000);
        setTimeout(() => {
          navigate("/admin/cars/topup");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update driver topup:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update driver topup");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    navigate("/admin/cars/topup");
  }

  const selectedVehicleName =
    vehicleTypes.find((v) => String(v.id || v.mysqlId) === String(vehicleType))?.name || "Vehicle";

  return (
    <div className="edit-topup-page">
      {/* Back Button */}
      <div className="edit-topup-topbar">
        <button className="edit-topup-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Manage Driver Topup</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-topup-alert-success">
          <CheckCircle2 size={18} />
          <span>Topup settings for <strong>{selectedVehicleName}</strong> updated successfully!</span>
        </div>
      )}

      <div className="edit-topup-card">
        <div className="edit-topup-card-header">
          <div className="edit-topup-header-icon">
            <Wallet size={20} />
          </div>
          <div>
            <h3 className="edit-topup-card-title">Edit Driver Topup</h3>
            <p className="edit-topup-card-subtitle">
              Update topup amount, slabs and distance limits for #{id} ({selectedVehicleName})
            </p>
          </div>
        </div>

        <div className="edit-topup-card-body">
          <form onSubmit={handleSubmit}>
            <div className="edit-topup-form-grid">
              {/* Vehicle Type */}
              <div className="edit-topup-form-group">
                <label>
                  Vehicle Type <span className="edit-topup-req">*</span>
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select Vehicle Type</option>
                  {vehicleTypes.map((v) => (
                    <option key={v.id || v._id} value={v.id || v.mysqlId || v._id}>
                      {v.name || v.typeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topup Amount */}
              <div className="edit-topup-form-group">
                <label>
                  Topup Amount (₹) <span className="edit-topup-req">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {/* Slabs Amount */}
              <div className="edit-topup-form-group">
                <label>Slabs Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 750"
                  value={slabs}
                  onChange={(e) => setSlabs(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Time Limit */}
              <div className="edit-topup-form-group">
                <label>Time Limit (in minutes)</label>
                <input
                  type="number"
                  placeholder="e.g. 720"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Above Distance */}
              <div className="edit-topup-form-group">
                <label>Above Distance (in KM)</label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={aboveDistance}
                  onChange={(e) => setAboveDistance(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* Extra Charge */}
              <div className="edit-topup-form-group">
                <label>Extra Charge (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 12"
                  value={extraCharge}
                  onChange={(e) => setExtraCharge(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="edit-topup-actions">
              <button
                type="submit"
                className="edit-topup-btn-submit"
                disabled={submitting || loading}
              >
                {submitting ? "Updating..." : "Update Driver Topup"}
              </button>
              <button
                type="button"
                className="edit-topup-btn-cancel"
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
