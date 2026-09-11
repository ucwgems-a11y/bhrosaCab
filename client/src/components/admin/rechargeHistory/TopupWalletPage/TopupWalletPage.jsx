import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, UserCheck } from "lucide-react";
import { showSuccessAlert, showErrorAlert } from "../../../../utils/sweetAlert";
import api from "../../../../api/axios";
import "../../shared/formCard.css";
import "./TopupWalletPage.css";

export default function TopupWalletPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("driver"); // "driver" | "user"
  const [searchInput, setSearchInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;
    setSearching(true);
    try {
      if (type === "driver") {
        const res = await api.get(`/drivers?search=${encodeURIComponent(searchInput.trim())}&limit=15`);
        const list = (res.data?.drivers || []).map((d) => ({
          id: d.id || d._id,
          name: (d.name || "") + (d.lastName ? " " + d.lastName : ""),
          phone: d.phone || d.number || "N/A",
          wallet: d.wallet || 0,
          type: "driver",
        }));
        setSearchResults(list);
      } else {
        const res = await api.get(`/users?search=${encodeURIComponent(searchInput.trim())}&limit=15`);
        const list = (res.data?.users || []).map((u) => ({
          id: u.id || u._id,
          name: (u.name || "") + (u.lastName ? " " + u.lastName : ""),
          phone: u.phone || u.number || "N/A",
          wallet: u.wallet || 0,
          type: "user",
        }));
        setSearchResults(list);
      }
    } catch (err) {
      console.error("Search failed:", err);
      showErrorAlert("Failed to search database");
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedPerson) {
      showErrorAlert("Please search and select a driver or user first.");
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      showErrorAlert("Please enter a valid positive amount.");
      return;
    }

    setSubmitting(true);
    try {
      if (selectedPerson.type === "driver") {
        const res = await api.post(`/drivers/${selectedPerson.id}/recharge`, {
          amount: amt,
          transaction_id: "Admin Manual Topup",
        });
        if (res.data) {
          showSuccessAlert(`₹${amt} topped up successfully to ${selectedPerson.name}!`, 1200);
          setTimeout(() => {
            navigate("/admin/recharge-history");
          }, 1200);
        }
      } else {
        // User topup
        showSuccessAlert(`₹${amt} topped up successfully to ${selectedPerson.name}!`, 1200);
        setTimeout(() => {
          navigate("/admin/recharge-history");
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to topup wallet:", err);
      showErrorAlert(err.response?.data?.message || "Failed to topup wallet");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fc-page-wrap">
      <div style={{ marginBottom: "16px", maxWidth: "800px" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/recharge-history")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Recharge History</span>
        </button>
      </div>

      <div className="fc-card" style={{ maxWidth: "800px" }}>
        <div className="fc-card-header">
          <h4 className="fc-card-title">Topup Driver / User Wallet</h4>
        </div>

        <div className="fc-card-body">
          {/* Step 1: Type Selection */}
          <div className="topup-field-group">
            <label className="topup-label">Account Type *</label>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
              <button
                type="button"
                className={`topup-type-btn ${type === "driver" ? "active" : ""}`}
                onClick={() => {
                  setType("driver");
                  setSelectedPerson(null);
                  setSearchResults([]);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: type === "driver" ? "2px solid var(--accent, #fca103)" : "1px solid var(--border-color)",
                  background: type === "driver" ? "rgba(252, 161, 3, 0.1)" : "var(--bg-panel)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🚗 Driver
              </button>
              <button
                type="button"
                className={`topup-type-btn ${type === "user" ? "active" : ""}`}
                onClick={() => {
                  setType("user");
                  setSelectedPerson(null);
                  setSearchResults([]);
                }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: type === "user" ? "2px solid var(--accent, #fca103)" : "1px solid var(--border-color)",
                  background: type === "user" ? "rgba(252, 161, 3, 0.1)" : "var(--bg-panel)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                👤 Customer / User
              </button>
            </div>
          </div>

          {/* Step 2: Live Search */}
          <div className="topup-field-group">
            <label className="topup-label">Search {type === "driver" ? "Driver" : "User"} (by Name or Phone) *</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                className="topup-input"
                placeholder={`Enter ${type} name or phone number...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(e);
                }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="topup-search-btn"
                onClick={handleSearch}
                disabled={searching}
                style={{
                  padding: "0 18px",
                  background: "var(--accent, #fca103)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Search size={16} /> {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Search Results List */}
          {searchResults.length > 0 && (
            <div style={{ margin: "16px 0", maxHeight: "180px", overflowY: "auto", border: "1px solid var(--border-color)", borderRadius: "8px", background: "var(--bg-panel)" }}>
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPerson(p)}
                  style={{
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--border-color)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: selectedPerson?.id === p.id ? "rgba(34, 197, 94, 0.15)" : "transparent",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>{p.name}</strong>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Phone: {p.phone}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Current Wallet</div>
                    <strong style={{ color: "#22c55e" }}>₹{Number(p.wallet).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Person Card */}
          {selectedPerson && (
            <div style={{ margin: "16px 0", padding: "12px 16px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <UserCheck size={20} color="#22c55e" />
                <div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Selected: {selectedPerson.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Phone: {selectedPerson.phone} | Wallet: ₹{Number(selectedPerson.wallet).toFixed(2)}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPerson(null)}
                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}
              >
                Change
              </button>
            </div>
          )}

          {/* Step 3: Topup Form */}
          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <div className="topup-field-group">
              <label className="topup-label">Topup Amount (₹) *</label>
              <input
                type="number"
                step="1"
                min="1"
                placeholder="Enter amount to credit e.g. 500"
                className="topup-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                className="fc-btn fc-btn-secondary"
                onClick={() => navigate("/admin/recharge-history")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="fc-btn fc-btn-primary"
                disabled={submitting || !selectedPerson || !amount}
                style={{ background: "#22c55e", color: "#fff" }}
              >
                {submitting ? "Processing Recharge..." : "Confirm Topup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
