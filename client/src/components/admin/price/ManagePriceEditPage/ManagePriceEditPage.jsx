import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, DollarSign, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import countries from "../countries";
import "./ManagePriceEditPage.css";

const mockPrices = [
  { id: 1, country: "India", startKm: "0.00", endKm: "2.00", startTime: "08:01", endTime: "16:00", price: 45, weather: "clear" },
  { id: 2, country: "India", startKm: "0.00", endKm: "2.00", startTime: "08:01", endTime: "16:00", price: 50, weather: "rain" },
  { id: 3, country: "India", startKm: "0.00", endKm: "2.00", startTime: "12:01", endTime: "14:00", price: 55, weather: "clear" },
  { id: 4, country: "India", startKm: "0.00", endKm: "2.00", startTime: "14:01", endTime: "16:00", price: 52, weather: "clear" },
  { id: 5, country: "India", startKm: "0.00", endKm: "2.00", startTime: "16:01", endTime: "18:00", price: 53, weather: "clear" },
  { id: 6, country: "India", startKm: "2.01", endKm: "3.50", startTime: "00:01", endTime: "02:00", price: 70, weather: "clear" },
  { id: 7, country: "Germany", startKm: "1", endKm: "3", startTime: "10:39", endTime: "12:38", price: 5, weather: "clear" },
];

export default function ManagePriceEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const priceData = mockPrices.find((item) => item.id === Number(id)) || mockPrices[0];

  const [price, setPrice] = useState(priceData ? priceData.price : "");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (priceData) {
      setPrice(priceData.price);
    }
  }, [id]);

  if (!priceData) {
    return (
      <div className="price-edit-page">
        <div className="price-edit-card not-found">
          <h2>Price Rule Not Found</h2>
          <button className="price-edit-back-btn" onClick={() => navigate("/admin/price/manage")}>
            <ArrowLeft size={16} /> Back to Distance Pricing
          </button>
        </div>
      </div>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setShowSuccess(true);
      showSuccessAlert("Your work has been saved", 1000);
      setTimeout(() => {
        navigate("/admin/price/manage");
      }, 1000);
    }, 300);
  }

  function handleCancel() {
    navigate("/admin/price/manage");
  }

  return (
    <div className="price-edit-page">
      {/* Topbar Back Navigation */}
      <div className="price-edit-topbar">
        <button className="price-edit-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Distance Pricing</span>
        </button>
      </div>

      {showSuccess && (
        <div className="price-edit-alert-success">
          <CheckCircle2 size={18} />
          <span>Distance price rule #{id} updated to <strong>₹{price}</strong> successfully!</span>
        </div>
      )}

      <div className="price-edit-card">
        {/* Header */}
        <div className="price-edit-header">
          <div className="price-edit-header-icon">
            <DollarSign size={20} />
          </div>
          <div>
            <h3 className="price-edit-card-title">Edit Distance Price</h3>
            <p className="price-edit-card-subtitle">
              Pricing rule for {priceData.country} ({priceData.startKm} km - {priceData.endKm} km)
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="price-edit-body">
          <div className="price-edit-notice">
            <AlertCircle size={16} />
            <span>You can only modify the <strong>Price</strong> field. Distance, time slot, and geography parameters are locked.</span>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Distance Section */}
            <div className="price-edit-section">
              <div className="price-edit-section-header">
                <span>Distance Range</span>
                <Lock size={13} className="lock-icon" />
              </div>
              <div className="price-edit-grid">
                <div className="price-edit-form-group">
                  <label>Start (KM)</label>
                  <input type="text" value={priceData.startKm} readOnly className="price-readonly" />
                </div>
                <div className="price-edit-form-group">
                  <label>End (KM)</label>
                  <input type="text" value={priceData.endKm} readOnly className="price-readonly" />
                </div>
              </div>
            </div>

            {/* Time Slot Section */}
            <div className="price-edit-section">
              <div className="price-edit-section-header">
                <span>Time Slot Window</span>
                <Lock size={13} className="lock-icon" />
              </div>
              <div className="price-edit-grid">
                <div className="price-edit-form-group">
                  <label>Start Time</label>
                  <input type="text" value={priceData.startTime} readOnly className="price-readonly" />
                </div>
                <div className="price-edit-form-group">
                  <label>End Time</label>
                  <input type="text" value={priceData.endTime} readOnly className="price-readonly" />
                </div>
              </div>
            </div>

            {/* Country & Weather Section */}
            <div className="price-edit-section">
              <div className="price-edit-section-header">
                <span>Geography &amp; Conditions</span>
                <Lock size={13} className="lock-icon" />
              </div>
              <div className="price-edit-grid">
                <div className="price-edit-form-group">
                  <label>Country</label>
                  <select value={priceData.country} disabled className="price-readonly">
                    {countries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="price-edit-form-group">
                  <label>Weather Condition</label>
                  <input
                    type="text"
                    value={priceData.weather ? priceData.weather.toUpperCase() : "CLEAR"}
                    readOnly
                    className="price-readonly"
                  />
                </div>
              </div>
            </div>

            {/* Editable Price Field */}
            <div className="price-edit-section price-highlight-section">
              <div className="price-edit-form-group">
                <label className="price-active-label">
                  Rate Card Price (₹) <span className="price-req">*</span>
                </label>
                <div className="price-input-wrap">
                  <span className="price-currency-prefix">₹</span>
                  <input
                    type="number"
                    value={price}
                    min="0"
                    step="0.01"
                    placeholder="Enter price in INR"
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    autoFocus
                    className="price-active-input"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="price-edit-actions">
              <button
                type="submit"
                className="price-btn-submit"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Distance Price"}
              </button>
              <button
                type="button"
                className="price-btn-cancel"
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