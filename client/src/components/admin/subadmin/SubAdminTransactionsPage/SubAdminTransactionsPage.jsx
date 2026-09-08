import { useState, useEffect } from "react";
import {
  Banknote,
  List,
  Eye,
  X,
  FileText,
  User,
  Building,
  Info,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Save,
} from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";
import "./SubAdminTransactionsPage.css";

const mapTransactionItem = (item, idx) => {
  let datePart = "N/A";
  let timePart = "";
  const rawDate = item.requestedDate || item.createdAt || "";
  if (rawDate && rawDate.includes(",")) {
    const parts = rawDate.split(",");
    datePart = parts[0]?.trim() || "N/A";
    timePart = parts[1]?.trim() || "";
  } else if (rawDate) {
    datePart = rawDate;
  }

  const realSubAdminName =
    item.subAdminName && item.subAdminName !== "Amar Bhrosa" && item.subAdminName !== "Harvinder Singh"
      ? item.subAdminName
      : (item.accountHolder && item.accountHolder !== "aaaaa" && item.accountHolder !== "Harvinder Singh" ? item.accountHolder : "Sub Admin");

  const realAccountHolder =
    item.accountHolder && item.accountHolder !== "aaaaa" && item.accountHolder !== "Harvinder Singh"
      ? item.accountHolder
      : (item.holderName && item.holderName !== "aaaaa" && item.holderName !== "Harvinder Singh" ? item.holderName : realSubAdminName);

  return {
    id: item._id || item.id || idx + 1,
    rawId: item._id || item.id,
    subAdminId: item.subAdminId || null,
    subAdminName: realSubAdminName,
    state: item.state && item.state !== "Goa" ? item.state : (item.state || "N/A"),
    amount:
      typeof item.amount === "number"
        ? `₹${item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
        : (item.amount || "₹0.00"),
    status: item.status || "Pending",
    date: datePart,
    time: timePart,
    bankName: item.bankName || "N/A",
    accountHolder: realAccountHolder,
    accountNumber: item.accountNumber || "N/A",
    ifscCode: item.ifscCode || "N/A",
    branchName: item.branchName || item.branch || "N/A",
    withdrawalId: `#${item.withdrawalId || (item._id ? item._id.toString().slice(-6).toUpperCase() : idx + 1)}`,
    bankId: item.bankId || "1",
    createdAt: item.requestedDate || item.createdAt || datePart,
    updatedAt: item.updatedAt || item.requestedDate || datePart,
    rejectReason: item.rejectReason || "",
  };
};

export default function SubAdminTransactionsPage() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_withdrawal_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => mapTransactionItem(item, idx));
        }
      }
    } catch (e) {}
    return [];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [updateStatusVal, setUpdateStatusVal] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/subadmin-auth/withdrawal-requests`);
      if (res.data && res.data.success && Array.isArray(res.data.requests)) {
        const mapped = res.data.requests.map((item, idx) => mapTransactionItem(item, idx));
        setTransactions(mapped);
        return;
      }
    } catch (err) {
      console.warn("Could not fetch withdrawal requests from backend:", err);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }

    try {
      const saved = localStorage.getItem("crm_withdrawal_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const mapped = parsed.map((item, idx) => mapTransactionItem(item, idx));
          setTransactions(mapped);
        }
      }
    } catch (e) {}
  };

  const handleReload = () => {
    setSearchTerm("");
    loadTransactions();
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) => {
    const q = searchTerm.toLowerCase();
    return (
      (t.subAdminName && t.subAdminName.toLowerCase().includes(q)) ||
      (t.accountHolder && t.accountHolder.toLowerCase().includes(q)) ||
      (t.state && t.state.toLowerCase().includes(q)) ||
      (t.amount && t.amount.toLowerCase().includes(q)) ||
      (t.bankName && t.bankName.toLowerCase().includes(q))
    );
  });

  const handleOpenModal = (t) => {
    setSelectedTransaction(t);
    setUpdateStatusVal("");
    setRejectReason(t.rejectReason || "");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTransaction(null);
    setUpdateStatusVal("");
    setRejectReason("");
  };

  const handleSaveStatus = async () => {
    if (!updateStatusVal || !selectedTransaction) return;
    if (updateStatusVal === "Rejected" && !rejectReason.trim()) return;

    const newStatus = updateStatusVal === "Completed" ? "Completed" : "Rejected";
    const nowStr =
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      " " +
      new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    if (selectedTransaction.rawId) {
      try {
        await axios.put(
          `${API_BASE_URL}/subadmin-auth/withdrawal-request/${selectedTransaction.rawId}/status`,
          {
            status: newStatus,
            rejectReason: newStatus === "Rejected" ? rejectReason.trim() : "",
          }
        );
      } catch (err) {
        console.warn("Failed to update status on backend:", err);
      }
    }

    const updatedTx = {
      ...selectedTransaction,
      status: newStatus,
      rejectReason: newStatus === "Rejected" ? rejectReason.trim() : "",
      updatedAt: nowStr,
    };

    setSelectedTransaction(updatedTx);

    const updatedList = transactions.map((item) =>
      item.id === updatedTx.id || item.rawId === updatedTx.rawId
        ? updatedTx
        : item
    );
    setTransactions(updatedList);

    // Sync with localStorage crm_withdrawal_requests
    try {
      const saved = localStorage.getItem("crm_withdrawal_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const updatedLocal = parsed.map((item) => {
            if (
              item.id === updatedTx.id ||
              item._id === updatedTx.rawId ||
              item.id === updatedTx.rawId
            ) {
              return {
                ...item,
                status: newStatus,
                rejectReason: updatedTx.rejectReason,
              };
            }
            return item;
          });
          localStorage.setItem("crm_withdrawal_requests", JSON.stringify(updatedLocal));
        }
      }
    } catch (e) {}
  };

  return (
    <div className="container-fluid transaction-page">
      {/* Header */}
      <div className="transaction-header">
        <h4 className="transaction-page-title">
          <Banknote size={28} className="text-primary me-2 transaction-page-icon" />
          <span>Sub Admin Transaction List </span>
        </h4>
        <p className="transaction-page-subtitle">
          View and manage all sub admin withdrawal transactions.
        </p>
      </div>

      {/* Main Card */}
      <div className="card transaction-card">
        {/* Card Header */}
        <div className="transaction-card-header">
          <div className="transaction-card-title">
            <div className="transaction-card-icon">
              <List size={18} />
            </div>
            <div>
              <h5>Withdrawal Transactions</h5>
              <span>Sub Admin withdrawal request details</span>
            </div>
          </div>

          <div className="transaction-search-wrap" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div className="transaction-search-input-box">
              <Search size={16} className="transaction-search-icon" />
              <input
                type="text"
                placeholder="Search sub admin, state, bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="transaction-search-input"
              />
            </div>
            <button
              type="button"
              className="transaction-reload-btn"
              onClick={handleReload}
              title="Reload Transactions"
            >
              <RefreshCw size={14} className={loading ? "spin-fast" : ""} />
              <span>Reload</span>
            </button>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="transaction-table-wrapper">
          <table className="transaction-table">
            <thead>
              <tr>
                <th style={{ width: "60px", textAlign: "center" }}>#</th>
                <th>Sub Admin Name</th>
                <th>State</th>
                <th>Withdrawal Amount</th>
                <th style={{ textAlign: "center" }}>Status</th>
                <th>Date</th>
                <th style={{ width: "80px", textAlign: "center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="transaction-empty-cell">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, index) => (
                  <tr key={t.id || index}>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>
                      {index + 1}
                    </td>

                    {/* Sub Admin Name */}
                    <td>
                      <div className="subadmin-name">{t.subAdminName}</div>
                    </td>

                    {/* State */}
                    <td>
                      <div className="subadmin-state">{t.state}</div>
                    </td>

                    {/* Amount */}
                    <td>
                      <span className="withdraw-amount">{t.amount}</span>
                    </td>

                    {/* Status */}
                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`status-badge ${
                          t.status === "Approved" || t.status === "Completed"
                            ? "status-approved"
                            : t.status === "Rejected"
                            ? "status-rejected"
                            : "status-pending"
                        }`}
                      >
                        {t.status === "Approved" || t.status === "Completed" ? (
                          <CheckCircle size={12} className="me-1" />
                        ) : t.status === "Rejected" ? (
                          <XCircle size={12} className="me-1" />
                        ) : (
                          <Clock size={12} className="me-1" />
                        )}
                        {t.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      <div className="transaction-date-text">
                        {t.date}
                        <small className="d-block text-muted">{t.time}</small>
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="view-btn"
                        title="View Details"
                        onClick={() => handleOpenModal(t)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW DETAILS MODAL POPUP */}
      {modalOpen && selectedTransaction && (
        <div className="transaction-modal-overlay" onClick={handleCloseModal}>
          <div
            className="transaction-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="transaction-custom-modal">
              {/* Modal Header */}
              <div className="transaction-modal-header">
                <h4 className="transaction-modal-title">Withdrawal Details</h4>
                <button
                  type="button"
                  className="transaction-modal-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="transaction-modal-divider" />

              {/* Modal Body */}
              <div className="transaction-modal-body">
                {/* 1. Sub Admin Details */}
                <div className="detail-section-title">
                  <User size={16} className="detail-section-icon" />
                  <span>Sub Admin Details</span>
                </div>
                <div className="detail-grid-row">
                  <div className="detail-white-card">
                    <span className="detail-card-label">SUB ADMIN NAME</span>
                    <span className="detail-card-value">
                      {selectedTransaction.subAdminName}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">STATE</span>
                    <span className="detail-card-value">
                      {selectedTransaction.state}
                    </span>
                  </div>
                </div>

                <div className="transaction-modal-divider" />

                {/* 2. Withdrawal Details & Withdrawal Status (Side by Side matching Screenshot) */}
                <div className="detail-two-col-section">
                  {/* Left: Withdrawal Details */}
                  <div className="detail-col">
                    <div className="detail-section-title">
                      <span>Withdrawal Details</span>
                    </div>
                    <div className="detail-section-header-line" />
                    <div className="detail-white-card">
                      <span className="detail-card-label">WITHDRAWAL AMOUNT</span>
                      <span className="detail-card-value detail-amount-blue">
                        {selectedTransaction.amount}
                      </span>
                    </div>
                  </div>

                  {/* Right: Withdrawal Status / Update Status */}
                  <div className="detail-col">
                    <div className="detail-section-title">
                      <span>Withdrawal Status</span>
                    </div>
                    <div className="detail-section-header-line" />

                    {selectedTransaction.status === "Pending" ? (
                      <div className="detail-white-card update-status-card">
                        <span className="detail-card-label">UPDATE STATUS</span>
                        <div className="status-select-wrap">
                          <select
                            className="modal-status-select"
                            value={updateStatusVal}
                            onChange={(e) => setUpdateStatusVal(e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="Completed">Completed</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        {updateStatusVal === "Rejected" && (
                          <div className="reject-reason-wrap">
                            <span className="detail-card-label mt-1">REASON</span>
                            <textarea
                              className="modal-reject-reason-input"
                              placeholder="Enter rejection reason..."
                              rows={2}
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="mt-2">
                          <button
                            type="button"
                            className="modal-update-status-btn"
                            onClick={handleSaveStatus}
                            disabled={
                              !updateStatusVal ||
                              (updateStatusVal === "Rejected" && !rejectReason.trim())
                            }
                          >
                            <Save size={14} className="me-1" />
                            Update Status
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="detail-white-card">
                        <span className="detail-card-label">STATUS</span>
                        <div className="detail-card-value">
                          <span
                            className={`modal-status-badge ${
                              selectedTransaction.status === "Approved" ||
                              selectedTransaction.status === "Completed"
                                ? "modal-status-approved"
                                : selectedTransaction.status === "Rejected"
                                ? "modal-status-rejected"
                                : "modal-status-pending"
                            }`}
                          >
                            {selectedTransaction.status}
                          </span>
                        </div>
                        {selectedTransaction.status === "Rejected" &&
                          selectedTransaction.rejectReason && (
                            <div className="detail-rejected-reason-box">
                              <span className="detail-card-label">REASON</span>
                              <div className="detail-card-value text-danger" style={{ fontSize: "13px", marginTop: "2px" }}>
                                {selectedTransaction.rejectReason}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="transaction-modal-divider" />

                {/* 3. Bank Details */}
                <div className="detail-section-title">
                  <Building size={16} className="detail-section-icon" />
                  <span>Bank Details</span>
                </div>
                <div className="detail-grid-row">
                  <div className="detail-white-card">
                    <span className="detail-card-label">BANK NAME</span>
                    <span className="detail-card-value">
                      {selectedTransaction.bankName}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">ACCOUNT HOLDER</span>
                    <span className="detail-card-value">
                      {selectedTransaction.accountHolder}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">ACCOUNT NUMBER</span>
                    <span className="detail-card-value">
                      {selectedTransaction.accountNumber}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">IFSC CODE</span>
                    <span className="detail-card-value">
                      {selectedTransaction.ifscCode}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">BRANCH NAME</span>
                    <span className="detail-card-value">
                      {selectedTransaction.branchName}
                    </span>
                  </div>
                </div>

                <div className="transaction-modal-divider" />

                {/* 4. Transaction Information */}
                <div className="detail-section-title">
                  <Info size={16} className="detail-section-icon" />
                  <span>Transaction Information</span>
                </div>
                <div className="detail-grid-row">
                  <div className="detail-white-card">
                    <span className="detail-card-label">WITHDRAWAL ID</span>
                    <span className="detail-card-value">
                      {selectedTransaction.withdrawalId}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">BANK ID</span>
                    <span className="detail-card-value">
                      {selectedTransaction.bankId}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">CREATED AT</span>
                    <span className="detail-card-value">
                      {selectedTransaction.createdAt}
                    </span>
                  </div>
                  <div className="detail-white-card">
                    <span className="detail-card-label">UPDATED AT</span>
                    <span className="detail-card-value">
                      {selectedTransaction.updatedAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
