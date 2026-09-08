import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import "../../shared/formCard.css";
import "./TopupWalletPage.css";

const mockPersons = [
  { id: "1", type: "driver", name: "Basant Singh", phone: "+91 9876543210" },
  { id: "2", type: "driver", name: "Hardeep Singh", phone: "+91 9812345678" },
  { id: "3", type: "driver", name: "Sarabjit Singh", phone: "+91 9723456789" },
  { id: "4", type: "driver", name: "Sarfuddin", phone: "+91 9634567890" },
  { id: "5", type: "driver", name: "Shabbir Mohammed Shaikh", phone: "+91 9545678901" },
  { id: "6", type: "user", name: "Rahul Sharma", phone: "+91 9876112233" },
  { id: "7", type: "user", name: "Priya Patel", phone: "+91 9876223344" },
  { id: "8", type: "user", name: "Amit Kumar", phone: "+91 9876334455" },
];

export default function TopupWalletPage() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredPersons = mockPersons.filter((p) => {
    if (type && p.type !== type) return false;
    if (searchInput.trim()) {
      const q = searchInput.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.phone.includes(q);
    }
    return true;
  });

  function handleSearch(e) {
    e.preventDefault();
    setShowResults(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showSuccessAlert("Wallet topped up successfully!", 1200);
      setTimeout(() => {
        navigate("/admin/recharge-history");
      }, 1200);
    }, 300);
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

      <div className="fc-card topup-card">
        <div className="fc-card-header">
          <h4 className="fc-card-title">Topup Wallet</h4>
        </div>
        <div className="fc-card-body">
          <form onSubmit={handleSubmit} className="topup-form">
            <div className="topup-form-group">
              <label className="topup-label">Select Type</label>
              <select
                className="topup-select"
                name="type"
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setSelectedPerson("");
                }}
                required
              >
                <option value="">Select</option>
                <option value="driver">Driver</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="topup-form-group">
              <label className="topup-label">Search Name / Phone</label>
              <input
                type="text"
                id="searchInput"
                className="topup-input"
                placeholder="Enter Name or Phone"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="topup-btn-info"
              id="searchBtn"
              onClick={handleSearch}
            >
              Search
            </button>

            {showResults && (
              <div className="topup-form-group" id="resultDiv">
                <label className="topup-label">Select Person</label>
                <select
                  className="topup-select"
                  name="id"
                  id="resultSelect"
                  value={selectedPerson}
                  onChange={(e) => setSelectedPerson(e.target.value)}
                  required
                >
                  <option value="">Select</option>
                  {filteredPersons.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.phone}) - {p.type === "driver" ? "Driver" : "User"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="topup-form-group">
              <label className="topup-label">Amount</label>
              <input
                type="number"
                className="topup-input"
                name="amount"
                min="1"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="topup-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Topup Wallet"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
