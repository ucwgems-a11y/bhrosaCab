import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  List,
  Plus,
  Inbox,
  Banknote,
  Calendar,
  Building,
} from "lucide-react";
import axios from "axios";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import { API_BASE_URL } from "../../../config";
import "./CrmWithdrawalList.css";

export default function CrmWithdrawalList() {
  const { subAdmin } = useCrmAuth();
  const [requests, setRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("crm_withdrawal_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    let isMounted = true;
    async function loadRequests() {
      const subAdminId = subAdmin?._id || subAdmin?.id;
      try {
        const url = subAdminId
          ? `${API_BASE_URL}/subadmin-auth/withdrawal-requests?subAdminId=${subAdminId}`
          : `${API_BASE_URL}/subadmin-auth/withdrawal-requests`;
        const res = await axios.get(url);
        if (res.data && res.data.success && Array.isArray(res.data.requests) && isMounted) {
          const mapped = res.data.requests.map((r) => ({
            id: r._id || r.id,
            subAdminId: r.subAdminId,
            subAdminName: r.subAdminName,
            bankName: r.bankName,
            accountNumber: r.accountNumber,
            accountHolder: r.accountHolder || r.subAdminName,
            holderName: r.accountHolder || r.subAdminName,
            ifscCode: r.ifscCode,
            branchName: r.branchName,
            amount:
              typeof r.amount === "number"
                ? `₹${r.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                : r.amount,
            status: r.status,
            requestedDate: r.requestedDate,
            rejectReason: r.rejectReason,
          }));
          setRequests(mapped);
          localStorage.setItem("crm_withdrawal_requests", JSON.stringify(mapped));
          return;
        }
      } catch (err) {
        console.warn("Could not fetch withdrawal requests from server:", err);
      }

      // fallback to localStorage
      try {
        const saved = localStorage.getItem("crm_withdrawal_requests");
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map((item) => ({
              ...item,
              accountHolder:
                !item.accountHolder || item.accountHolder === "aaaaa" || item.accountHolder === "Harvinder Singh"
                  ? (subAdmin?.name || item.subAdminName || "Sub Admin")
                  : item.accountHolder,
              holderName:
                !item.holderName || item.holderName === "aaaaa" || item.holderName === "Harvinder Singh"
                  ? (subAdmin?.name || item.subAdminName || "Sub Admin")
                  : item.holderName,
            }));
            setRequests(cleaned);
          }
        }
      } catch (e) {}
    }

    loadRequests();
    return () => {
      isMounted = false;
    };
  }, [subAdmin]);

  return (
    <div className="crm-withdraw-list-page-wrap">
      {/* Page Header */}
      <div className="crm-withdraw-list-page-header">
        <div>
          <h3 className="crm-withdraw-list-page-title">
            <Landmark size={24} className="crm-withdraw-list-header-icon" />
            Withdrawal Requests
          </h3>
          <p className="crm-withdraw-list-page-subtitle">
            Manage and track your withdrawal requests
          </p>
        </div>

        <div>
          <Link
            to="/crm-withdrawal"
            className="crm-withdraw-list-request-btn"
          >
            <Plus size={16} />
            <span>Request Withdrawal</span>
          </Link>
        </div>
      </div>

      {/* Main Card */}
      <div className="crm-withdraw-list-card">
        {/* Card Header */}
        <div className="crm-withdraw-list-card-header">
          <div className="crm-withdraw-list-card-icon">
            <List size={20} />
          </div>
          <div>
            <h4 className="crm-withdraw-list-card-title">Withdrawal List</h4>
            <p className="crm-withdraw-list-card-subtitle">
              All your withdrawal requests
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="crm-withdraw-list-card-body">
          <div className="crm-withdraw-list-table-wrapper">
            <table className="crm-withdraw-list-table">
              <thead>
                <tr>
                  <th style={{ width: "50px", textAlign: "center" }}>#</th>
                  <th>Bank Details</th>
                  <th>Account Holder</th>
                  <th>IFSC</th>
                  <th style={{ textAlign: "center" }}>Amount</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Requested Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="crm-withdraw-list-empty">
                      <div className="crm-withdraw-list-empty-icon">
                        <Banknote size={36} />
                      </div>
                      <h5>No Withdrawal Requests</h5>
                      <p>You have not submitted any withdrawal request yet.</p>
                      {/* <Link
                        to="/crm-withdrawal"
                        className="crm-withdraw-empty-action-btn"
                      >
                        <Plus size={14} />
                        <span>Submit First Request</span>
                      </Link> */}
                    </td>
                  </tr>
                ) : (
                  requests.map((req, index) => (
                    <tr key={req.id || index}>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>
                        {index + 1}
                      </td>

                      {/* Bank Details */}
                      <td>
                        <div className="crm-withdraw-bank-cell">
                          <Building size={16} className="crm-withdraw-table-icon" />
                          <div>
                            <strong className="crm-withdraw-bank-name">
                              {req.bankName || "Bank"}
                            </strong>
                            <small className="crm-withdraw-acc-no">
                              A/C: {req.accountNumber || "N/A"}
                            </small>
                          </div>
                        </div>
                      </td>

                      {/* Account Holder */}
                      <td>
                        <strong className="crm-withdraw-holder-name">
                          {req.accountHolder || req.holderName || req.subAdminName || subAdmin?.name || "N/A"}
                        </strong>
                      </td>

                      {/* IFSC */}
                      <td>
                        <span className="crm-withdraw-ifsc-text">
                          {req.ifscCode || "N/A"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td style={{ textAlign: "center", fontWeight: 700 }}>
                        <span className="crm-withdraw-amount-text">
                          {req.amount}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ textAlign: "center" }}>
                        <span
                          className={`crm-withdraw-status-badge ${
                            req.status === "Approved"
                              ? "status-approved"
                              : req.status === "Rejected"
                              ? "status-rejected"
                              : "status-pending"
                          }`}
                        >
                          {req.status || "Pending"}
                        </span>
                      </td>

                      {/* Requested Date */}
                      <td style={{ textAlign: "center" }}>
                        <div className="crm-withdraw-date-cell">
                          <Calendar size={13} />
                          <span>{req.requestedDate}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
