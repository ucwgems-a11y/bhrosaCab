import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Banknote,
  Landmark,
  Building,
  IndianRupee,
  Send,
  Info,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  PlusCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import { API_BASE_URL } from "../../../config";
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

  const [bankAccounts, setBankAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_bank_accounts");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((acc) => ({
            ...acc,
            accountHolder:
              !acc.accountHolder || acc.accountHolder === "aaaaa" || acc.accountHolder === "Harvinder Singh"
                ? realName
                : acc.accountHolder,
            holderName:
              !acc.holderName || acc.holderName === "aaaaa" || acc.holderName === "Harvinder Singh"
                ? (acc.accountHolder && acc.accountHolder !== "aaaaa" && acc.accountHolder !== "Harvinder Singh" ? acc.accountHolder : realName)
                : acc.holderName,
          }));
        }
      }
    } catch (e) {}
    return [
      {
        id: "1",
        bankName: "PNB BANK",
        accountNumber: "98765432101234",
        accountHolder: realName,
        holderName: realName,
        ifscCode: "PUNB0123456",
        branch: "Main Branch",
      },
    ];
  });

  const [selectedBankId, setSelectedBankId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subAdmin?.name) {
      setBankAccounts((prev) =>
        prev.map((acc) => ({
          ...acc,
          accountHolder:
            !acc.accountHolder || acc.accountHolder === "aaaaa" || acc.accountHolder === "Harvinder Singh" || acc.accountHolder === "Sub Admin"
              ? subAdmin.name
              : acc.accountHolder,
          holderName:
            !acc.holderName || acc.holderName === "aaaaa" || acc.holderName === "Harvinder Singh" || acc.holderName === "Sub Admin"
              ? subAdmin.name
              : acc.holderName,
        }))
      );
    }
  }, [subAdmin]);

  // Commission Stats
  const commissionSummary = {
    total: 5666.5,
    withdrawn: 0.0,
    pending: 0.0,
    available: 5666.5,
  };

  useEffect(() => {
    if (bankAccounts.length === 1 && !selectedBankId) {
      setSelectedBankId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedBankId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBankId) {
      Swal.fire({
        icon: "warning",
        title: "Select Bank Account",
        text: "Please select a bank account to receive your withdrawal.",
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

    if (numAmount > commissionSummary.available) {
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
      (b) => String(b.id) === String(selectedBankId)
    );
    const effectiveHolder =
      chosenBank?.accountHolder || chosenBank?.holderName || realName;

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
            bankName: chosenBank?.bankName || "PNB BANK",
            accountHolder: effectiveHolder,
            accountNumber: chosenBank?.accountNumber || "N/A",
            ifscCode: chosenBank?.ifscCode || "N/A",
            branchName: chosenBank?.branch || chosenBank?.branchName || "Main Branch",
            amount: numAmount,
          };

          let savedWithdrawal = null;
          try {
            const res = await axios.post(
              `${API_BASE_URL}/subadmin-auth/withdrawal-request`,
              payload
            );
            if (res.data && res.data.success) {
              savedWithdrawal = res.data.withdrawal;
            }
          } catch (apiErr) {
            console.warn("Backend withdrawal-request error, fallback to local:", apiErr);
          }

          const nowFormatted =
            new Date().toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }) +
            ", " +
            new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });

          const newRequest = {
            id: savedWithdrawal?._id || Date.now().toString(),
            _id: savedWithdrawal?._id || Date.now().toString(),
            subAdminId: subAdmin?._id || subAdmin?.id || null,
            subAdminName: subAdmin?.name || effectiveHolder,
            subAdminEmail: subAdmin?.email || "",
            state: subAdmin?.state || subAdmin?.city || "N/A",
            bankName: chosenBank?.bankName || "PNB BANK",
            accountNumber: chosenBank?.accountNumber || "N/A",
            accountHolder: effectiveHolder,
            holderName: effectiveHolder,
            ifscCode: chosenBank?.ifscCode || "N/A",
            branchName: chosenBank?.branch || chosenBank?.branchName || "Main Branch",
            amount: `₹${numAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}`,
            status: "Pending",
            requestedDate: savedWithdrawal?.requestedDate || nowFormatted,
          };

          try {
            const existing = JSON.parse(
              localStorage.getItem("crm_withdrawal_requests") || "[]"
            );
            localStorage.setItem(
              "crm_withdrawal_requests",
              JSON.stringify([newRequest, ...existing])
            );
          } catch (e) {}

          setAmount("");
          Swal.fire({
            icon: "success",
            title: "Request Submitted!",
            text: "Your withdrawal request has been sent for admin approval.",
            confirmButtonColor: "#5ea2a3",
            showCancelButton: true,
            confirmButtonText: "View Withdrawal List",
            cancelButtonText: "Stay Here",
          }).then((res) => {
            if (res.isConfirmed) {
              navigate("/crm-withdrawal-list");
            }
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Submission Error",
            text: err.message || "Failed to submit request.",
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
              {/* Info Alert Box (Pure White in screenshot) */}
              <div className="crm-withdraw-info-box">
                <Info size={18} className="crm-withdraw-info-icon" />
                <p>
                  Please select your bank account and enter the amount you want
                  to withdraw. Your withdrawal request will be processed after
                  admin approval.
                </p>
              </div>

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
                     <option key={b.id} value={b.id}>
                     {b.bankName}
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
                    disabled={loading}
                  >
                    <Send size={16} />
                    <span>{loading ? "Submitting..." : "Submit Request"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Commission Summary Cards (White rounded boxes) */}
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
