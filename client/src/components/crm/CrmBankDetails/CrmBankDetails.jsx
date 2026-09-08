import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, CreditCard, User, MapPin, Code, Save, Info, ListFilter, Edit2, Trash2 } from "lucide-react";
import { swalWithBootstrapButtons } from "../../../utils/sweetAlert";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import "./CrmBankDetails.css";

export default function CrmBankDetails() {
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

  const defaultBankAccounts = [
    {
      id: 1,
      accountNumber: "123456789",
      accountHolder: realName,
      bankName: "PNB BANK",
      branch: "Main Branch",
      ifscCode: "PUNB0123456",
    },
  ];

  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem("crm_bank_accounts");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((acc) => ({
            ...acc,
            accountHolder:
              !acc.accountHolder || acc.accountHolder === "aaaaa" || acc.accountHolder === "Harvinder Singh"
                ? realName
                : acc.accountHolder,
          }));
        }
      } catch (e) {}
    }
    return defaultBankAccounts;
  });

  const [formData, setFormData] = useState({
    account_number: "",
    account_holder_name: realName,
    bank_name: "",
    branch_name: "",
    ifsc_code: "",
  });

  useEffect(() => {
    if (subAdmin?.name && formData.account_holder_name === "Sub Admin") {
      setFormData((prev) => ({ ...prev, account_holder_name: subAdmin.name }));
    }
  }, [subAdmin]);

  useEffect(() => {
    localStorage.setItem("crm_bank_accounts", JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifsc_code" ? value.toUpperCase() : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.account_number || !formData.account_holder_name || !formData.bank_name || !formData.ifsc_code) {
      swalWithBootstrapButtons.fire({
        title: "Required Fields",
        text: "Please fill all mandatory fields marked with *",
        icon: "warning",
      });
      return;
    }

    const newAccount = {
      id: Date.now(),
      accountNumber: formData.account_number,
      accountHolder: formData.account_holder_name,
      bankName: formData.bank_name,
      branch: formData.branch_name || "N/A",
      ifscCode: formData.ifsc_code,
    };

    setBankAccounts((prev) => [...prev, newAccount]);

    swalWithBootstrapButtons.fire({
      title: "Bank Details Saved!",
      text: "New bank account has been added successfully.",
      icon: "success",
    });

    setFormData({
      account_number: "",
      account_holder_name: "",
      bank_name: "",
      branch_name: "",
      ifsc_code: "",
    });
  }

  function handleDelete(id) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "Do you really want to delete this bank account?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          setBankAccounts((prev) => prev.filter((acc) => acc.id !== id));
          swalWithBootstrapButtons.fire({
            title: "Deleted!",
            text: "Bank account has been removed.",
            icon: "success",
          });
        }
      });
  }

  return (
    <div className="crm-bank-page-wrap">
      {/* Header */}
      <div className="crm-bank-page-header">
        <h3 className="crm-bank-page-title">
          <Landmark className="crm-bank-header-icon" size={24} />
          Bank Details
        </h3>
        <p className="crm-bank-page-subtitle">Manage your bank account information securely</p>
      </div>

      {/* Add Bank Form Card */}
      <div className="crm-bank-card">
        <div className="crm-bank-card-header">
          <div className="crm-bank-card-icon">
            <Landmark size={22} />
          </div>
          <div>
            <h4 className="crm-bank-card-title">Add Bank Account</h4>
            <p className="crm-bank-card-subtitle">Enter your bank account details below</p>
          </div>
        </div>

        <div className="crm-bank-card-body">
          {/* Info Box */}
          <div className="crm-bank-info-box">
            <Info size={18} />
            <p>
              Please make sure that the bank details you provide are correct. These details may be used for future payments and settlements.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="crm-bank-form">
            <div className="crm-bank-grid">
              {/* Account Number */}
              <div className="crm-bank-form-group">
                <label>
                  Account Number <span className="text-danger">*</span>
                </label>
                <div className="crm-bank-input-wrapper">
                  <CreditCard className="crm-bank-input-icon" size={16} />
                  <input
                    type="text"
                    name="account_number"
                    placeholder="Enter account number"
                    maxLength="30"
                    value={formData.account_number}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Account Holder Name */}
              <div className="crm-bank-form-group">
                <label>
                  Account Holder Name <span className="text-danger">*</span>
                </label>
                <div className="crm-bank-input-wrapper">
                  <User className="crm-bank-input-icon" size={16} />
                  <input
                    type="text"
                    name="account_holder_name"
                    placeholder="Enter account holder name"
                    maxLength="100"
                    value={formData.account_holder_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Bank Name */}
              <div className="crm-bank-form-group">
                <label>
                  Bank Name <span className="text-danger">*</span>
                </label>
                <div className="crm-bank-input-wrapper">
                  <Landmark className="crm-bank-input-icon" size={16} />
                  <input
                    type="text"
                    name="bank_name"
                    placeholder="Enter bank name"
                    maxLength="100"
                    value={formData.bank_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Branch Name */}
              <div className="crm-bank-form-group">
                <label>Branch Name</label>
                <div className="crm-bank-input-wrapper">
                  <MapPin className="crm-bank-input-icon" size={16} />
                  <input
                    type="text"
                    name="branch_name"
                    placeholder="Enter branch name"
                    maxLength="100"
                    value={formData.branch_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* IFSC Code */}
              <div className="crm-bank-form-group">
                <label>
                  IFSC Code <span className="text-danger">*</span>
                </label>
                <div className="crm-bank-input-wrapper">
                  <Code className="crm-bank-input-icon" size={16} />
                  <input
                    type="text"
                    name="ifsc_code"
                    placeholder="Example: SBIN0001234"
                    maxLength="11"
                    style={{ textTransform: "uppercase" }}
                    value={formData.ifsc_code}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="crm-bank-submit-area">
              <button type="submit" className="crm-bank-submit-btn">
                <Save size={16} />
                <span>Save Bank Details</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Saved Bank Accounts Table Card */}
      <div className="crm-bank-card crm-bank-table-card">
        <div className="crm-bank-card-header">
          <div className="crm-bank-card-icon">
            <ListFilter size={22} />
          </div>
          <div>
            <h4 className="crm-bank-card-title">Saved Bank Accounts</h4>
            <p className="crm-bank-card-subtitle">View and manage your saved bank account details</p>
          </div>
        </div>

        <div className="crm-bank-table-body">
          <div className="crm-bank-table-wrap">
            <table className="crm-bank-table">
              <thead>
                <tr>
                  <th style={{ width: "60px", textAlign: "center" }}>Sr. No.</th>
                  <th>Account Number</th>
                  <th>Account Holder</th>
                  <th>Bank Name</th>
                  <th>Branch</th>
                  <th>IFSC Code</th>
                  <th style={{ width: "100px", textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bankAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="crm-bank-no-data">
                      No saved bank accounts found.
                    </td>
                  </tr>
                ) : (
                  bankAccounts.map((acc, i) => (
                    <tr key={acc.id}>
                      <td style={{ textAlign: "center", fontWeight: 700 }}>{i + 1}</td>
                      <td>
                        <span className="crm-bank-acc-num">{acc.accountNumber}</span>
                      </td>
                      <td className="crm-bank-holder">{acc.accountHolder}</td>
                      <td>
                        <div className="crm-bank-name-cell">
                          <Landmark size={14} className="crm-bank-cell-icon" />
                          <span>{acc.bankName}</span>
                        </div>
                      </td>
                      <td>{acc.branch}</td>
                      <td>
                        <span className="crm-bank-ifsc">{acc.ifscCode}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="crm-bank-actions">
                          <button
                            type="button"
                            className="crm-bank-action-btn edit"
                            title="Edit"
                            onClick={() => navigate(`/crm-bank-details-edit/${acc.id}`)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="crm-bank-action-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(acc.id)}
                          >
                            <Trash2 size={15} />
                          </button>
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
