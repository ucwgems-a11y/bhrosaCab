import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, CreditCard, User, MapPin, Code, Save, Info, ListFilter, Edit2, Trash2 } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import { useCrmAuth } from "../../../context/CrmAuthContext";
import api from "../../../api/axios";
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

  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    account_number: "",
    account_holder_name: realName,
    bank_name: "",
    branch_name: "",
    ifsc_code: "",
  });

  useEffect(() => {
    fetchBankAccounts();
  }, [subAdmin]);

  async function fetchBankAccounts() {
    setLoading(true);
    try {
      const res = await api.get("/subadmin-auth/bank-accounts");
      if (res.data && res.data.success && Array.isArray(res.data.bankAccounts)) {
        const mapped = res.data.bankAccounts.map((b) => ({
          id: b._id || b.id,
          _id: b._id || b.id,
          accountNumber: b.accountNumber,
          accountHolder: b.accountHolder || realName,
          bankName: b.bankName,
          branch: b.branch || "Main Branch",
          ifscCode: b.ifscCode,
        }));
        setBankAccounts(mapped);
      }
    } catch (err) {
      console.error("Failed to load bank accounts from API:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (subAdmin?.name && (!formData.account_holder_name || formData.account_holder_name === "Sub Admin")) {
      setFormData((prev) => ({ ...prev, account_holder_name: subAdmin.name }));
    }
  }, [subAdmin]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifsc_code" ? value.toUpperCase() : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.account_number || !formData.account_holder_name || !formData.bank_name || !formData.ifsc_code) {
      swalWithBootstrapButtons.fire({
        title: "Required Fields",
        text: "Please fill all mandatory fields marked with *",
        icon: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        accountNumber: formData.account_number.trim(),
        accountHolder: formData.account_holder_name.trim(),
        bankName: formData.bank_name.trim(),
        branch: (formData.branch_name || "Main Branch").trim(),
        ifscCode: formData.ifsc_code.trim().toUpperCase(),
      };

      const res = await api.post("/subadmin-auth/bank-accounts", payload);
      if (res.data && res.data.success) {
        showSuccessAlert("Bank account added successfully!");
        fetchBankAccounts();
        setFormData({
          account_number: "",
          account_holder_name: subAdmin?.name || realName,
          bank_name: "",
          branch_name: "",
          ifsc_code: "",
        });
      }
    } catch (err) {
      console.error("Failed to save bank account:", err);
      showErrorAlert(err.response?.data?.message || "Failed to save bank account");
    } finally {
      setSubmitting(false);
    }
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
      .then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.delete(`/subadmin-auth/bank-accounts/${id}`);
            showSuccessAlert("Bank account has been removed.");
            fetchBankAccounts();
          } catch (err) {
            console.error("Failed to delete bank account:", err);
            showErrorAlert(err.response?.data?.message || "Failed to delete bank account");
          }
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
              <button type="submit" className="crm-bank-submit-btn" disabled={submitting}>
                <Save size={16} />
                <span>{submitting ? "Saving..." : "Save Bank Details"}</span>
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="crm-bank-no-data">
                      Loading bank accounts from database...
                    </td>
                  </tr>
                ) : bankAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="crm-bank-no-data">
                      No saved bank accounts found. Use the form above to add your bank details.
                    </td>
                  </tr>
                ) : (
                  bankAccounts.map((acc, i) => (
                    <tr key={acc.id || acc._id}>
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
                            onClick={() => navigate(`/crm-bank-details-edit/${acc.id || acc._id}`)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="crm-bank-action-btn delete"
                            title="Delete"
                            onClick={() => handleDelete(acc.id || acc._id)}
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
