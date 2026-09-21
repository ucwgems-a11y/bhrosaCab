import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Banknote,
  Landmark,
  Building,
  Send,
  Info,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  PlusCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import api from "../../../api/axios";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import "./CrmWithdrawal.css";

export default function CrmWithdrawal() {
  const navigate = useNavigate();
  const { subAdmin } = useCrmAuth();

  const realName =
    subAdmin?.name ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem("subAdminUser"));
        return u?.name;
      } catch (e) {
        return null;
      }
    })() ||
    "Sub Admin";

  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [commissionSummary, setCommissionSummary] = useState({
    total: 0.0,
    withdrawn: 0.0,
    pending: 0.0,
    available: 0.0,
  });

  useEffect(() => {
    loadInitialData();
  }, [subAdmin]);

  async function loadInitialData() {
    setFetchingData(true);
    try {
      // 1. Fetch real bank accounts from database
      const bankRes = await api.get("/subadmin-auth/bank-accounts");
      let banks = [];
      if (bankRes.data && bankRes.data.success && Array.isArray(bankRes.data.bankAccounts)) {
        banks = bankRes.data.bankAccounts.map((b) => ({
          id: b._id || b.id,
          _id: b._id || b.id,
          bankName: b.bankName,
          accountNumber: b.accountNumber,
          accountHolder: b.accountHolder || realName,
          ifscCode: b.ifscCode,
          branch: b.branch || "Main Branch",
        }));
        setBankAccounts(banks);
        if (banks.length > 0) {
          setSelectedBankId(banks[0].id);
        }
      }

      // 2. Fetch withdrawal requests to calculate real commission stats
      const subAdminId = subAdmin?._id || subAdmin?.id;
      const withdrawRes = await api.get(
        subAdminId
          ? `/subadmin-auth/withdrawal-requests?subAdminId=${subAdminId}`
          : "/subadmin-auth/withdrawal-requests"
      );

      let totalWithdrawn = 0;
      let totalPending = 0;

      if (withdrawRes.data && withdrawRes.data.success && Array.isArray(withdrawRes.data.requests)) {
        withdrawRes.data.requests.forEach((r) => {
          const num = Number(r.amount) || 0;
          if (r.status === "Completed" || r.status === "Approved") {
            totalWithdrawn += num;
          } else if (r.status === "Pending") {
            totalPending += num;
          }
        });
      }

      const walletBal = Number(subAdmin?.wallet || 0);
      const totalCommission = walletBal + totalWithdrawn + totalPending;
      const availableCommission = Math.max(0, walletBal - totalPending);

      setCommissionSummary({
        total: totalCommission,
        withdrawn: totalWithdrawn,
        pending: totalPending,
        available: availableCommission > 0 ? availableCommission : walletBal,
      });
    } catch (err) {
      console.error("Failed to load withdrawal data from API:", err);
    } finally {
      setFetchingData(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBankId) {
      Swal.fire({
        icon: "warning",
        title: "Select Bank Account",
        text: "Please select a bank account to receive your withdrawal, or add one in Bank Details.",
        confirmButtonColor: "#5ea2a3",
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Amount",
        text: "Please enter a valid withdrawal amount.",
        confirmButtonColor: "#5ea2a3",
      });
      return;
    }

    if (commissionSummary.available > 0 && numAmount > commissionSummary.available) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Balance",
        text: `You can withdraw a maximum of ₹${commissionSummary.available.toLocaleString(
          "en-IN",
          { minimumFractionDigits: 2 }
        )}.`,
        confirmButtonColor: "#5ea2a3",
      });
      return;
    }

    const chosenBank = bankAccounts.find(
      (b) => String(b.id) === String(selectedBankId) || String(b._id) === String(selectedBankId)
    );
    const effectiveHolder = chosenBank?.accountHolder || realName;

    Swal.fire({
      title: "Confirm Withdrawal?",
      html: `
        <div style="text-align: left; font-size: 14px; padding: 10px 0;">
          <p><strong>Bank:</strong> ${chosenBank?.bankName || "Selected Bank"}</p>
          <p><strong>Account:</strong> ${chosenBank?.accountNumber || "N/A"}</p>
          <p><strong>Account Holder:</strong> ${effectiveHolder}</p>
          <p><strong>Amount:</strong> ₹${numAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          })}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit Request",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#5ea2a3",
      cancelButtonColor: "#6b7280",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          const payload = {
            subAdminId: subAdmin?._id || subAdmin?.id || null,
            subAdminName: subAdmin?.name || effectiveHolder,
            subAdminEmail: subAdmin?.email || "",
            state: subAdmin?.state || subAdmin?.city || "N/A",
            bankName: chosenBank?.bankName || "Bank",
            accountHolder: effectiveHolder,
            accountNumber: chosenBank?.accountNumber || "N/A",
            ifscCode: chosenBank?.ifscCode || "N/A",
            branchName: chosenBank?.branch || "Main Branch",
            amount: numAmount,
          };

          const res = await api.post("/subadmin-auth/withdrawal-request", payload);
          if (res.data && res.data.success) {
            setAmount("");
            Swal.fire({
              icon: "success",
              title: "Request Submitted!",
              text: "Your withdrawal request has been saved to database and sent for admin approval.",
              confirmButtonColor: "#5ea2a3",
              showCancelButton: true,
              confirmButtonText: "View Withdrawal List",
              cancelButtonText: "Stay Here",
            }).then((navRes) => {
              if (navRes.isConfirmed) {
                navigate("/crm-withdrawal-list");
              } else {
                loadInitialData();
              }
            });
          }
        } catch (err) {
          console.error("Failed to submit withdrawal request:", err);
          Swal.fire({
            icon: "error",
            title: "Submission Error",
            text: err.response?.data?.message || "Failed to submit withdrawal request.",
            confirmButtonColor: "#5ea2a3",
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="crm-withdraw-page-wrap">
      {/* Page Header */}
      <div className="crm-withdraw-page-header">
        <div>
          <h3 className="crm-withdraw-page-title">
            <Landmark size={24} className="crm-withdraw-header-icon" />
            Withdrawal Request
          </h3>
          <p className="crm-withdraw-page-subtitle">
            Request withdrawal from your available balance
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="crm-withdraw-card">
        {/* Card Header */}
        <div className="crm-withdraw-card-header">
          <div className="crm-withdraw-card-icon">
            <Building size={20} />
          </div>
          <div>
            <h4 className="crm-withdraw-card-title">Request Withdrawal</h4>
            <p className="crm-withdraw-card-subtitle">
              Select your bank account and enter the amount
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="crm-withdraw-card-body">
          <div className="crm-withdraw-grid">
            {/* Left Column: Form */}
            <div className="crm-withdraw-left-col">
              {/* Info Alert Box */}
              <div className="crm-withdraw-info-box">
                <Info size={18} className="crm-withdraw-info-icon" />
                <p>
                  Please select your bank account and enter the amount you want
                  to withdraw. Your withdrawal request will be processed after
                  admin approval.
                </p>
              </div>

              {bankAccounts.length === 0 && !fetchingData && (
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#f59e0b",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "18px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <span>No saved bank accounts found. Please add your bank details first.</span>
                  <Link
                    to="/crm-bank-details"
                    style={{
                      color: "#ffffff",
                      background: "#fca103",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      textDecoration: "none",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <PlusCircle size={14} /> Add Bank
                  </Link>
                </div>
              )}

              <form onSubmit={handleSubmit} className="crm-withdraw-form">
                {/* Bank Select */}
                <div className="crm-withdraw-form-group">
                  <label htmlFor="bank_id" className="crm-withdraw-label">
                    Bank Name <span className="text-danger">*</span>
                  </label>

                  <div className="crm-withdraw-select-wrapper">
                    <Landmark size={18} className="crm-withdraw-select-icon-left" />
                    <select
                      id="bank_id"
                      name="bank_id"
                      className="crm-withdraw-white-select"
                      value={selectedBankId}
                      onChange={(e) => setSelectedBankId(e.target.value)}
                      required
                    >
                      <option value="">Select Bank</option>
                      {bankAccounts.map((b) => (
                        <option key={b.id || b._id} value={b.id || b._id}>
                          {b.bankName} - {b.accountNumber} ({b.accountHolder})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="crm-withdraw-form-group">
                  <label htmlFor="amount" className="crm-withdraw-label">
                    Withdrawal Amount <span className="text-danger">*</span>
                  </label>

                  <div className="crm-withdraw-input-wrapper">
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      className="crm-withdraw-dark-input"
                      placeholder="Enter withdrawal amount"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="crm-withdraw-divider" />

                {/* Submit Button */}
                <div className="crm-withdraw-submit-area">
                  <button
                    type="submit"
                    className="crm-withdraw-submit-btn"
                    disabled={loading || bankAccounts.length === 0}
                  >
                    <Send size={16} />
                    <span>{loading ? "Submitting..." : "Submit Request"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Commission Summary Cards */}
            <div className="crm-withdraw-right-col">
              <div className="crm-commission-summary-wrap">
                {/* 1. Total Commission */}
                <div className="crm-commission-card">
                  <div className="crm-commission-badge-icon badge-green">
                    <Banknote size={22} />
                  </div>
                  <div className="crm-commission-card-text">
                    <span className="crm-commission-card-title">
                      Total Commission
                    </span>
                    <h3 className="crm-commission-card-amount">
                      ₹
                      {commissionSummary.total.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                </div>

                {/* 2. Total Withdraw Commission */}
                <div className="crm-commission-card">
                  <div className="crm-commission-badge-icon badge-pink">
                    <ArrowUpCircle size={22} />
                  </div>
                  <div className="crm-commission-card-text">
                    <span className="crm-commission-card-title">
                      Total Withdraw Commission
                    </span>
                    <h3 className="crm-commission-card-amount">
                      ₹
                      {commissionSummary.withdrawn.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                </div>

                {/* 3. Total Pending Commission */}
                <div className="crm-commission-card">
                  <div className="crm-commission-badge-icon badge-yellow">
                    <Clock size={22} />
                  </div>
                  <div className="crm-commission-card-text">
                    <span className="crm-commission-card-title">
                      Total Pending Commission
                    </span>
                    <h3 className="crm-commission-card-amount">
                      ₹
                      {commissionSummary.pending.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                </div>

                {/* 4. Available Commission */}
                <div className="crm-commission-card">
                  <div className="crm-commission-badge-icon badge-blue">
                    <CheckCircle size={22} />
                  </div>
                  <div className="crm-commission-card-text">
                    <span className="crm-commission-card-title">
                      Available Commission
                    </span>
                    <h3 className="crm-commission-card-amount">
                      ₹
                      {commissionSummary.available.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
