import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Landmark, CreditCard, User, MapPin, Code, Save, ArrowLeft } from "lucide-react";
import { swalWithBootstrapButtons, showSuccessAlert, showErrorAlert } from "../../../utils/sweetAlert";
import api from "../../../api/axios";
import "./CrmBankDetails.css";

export default function CrmEditBankDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    account_number: "",
    account_holder_name: "",
    bank_name: "",
    branch_name: "",
    ifsc_code: "",
  });

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);
      try {
        const res = await api.get("/subadmin-auth/bank-accounts");
        if (res.data && res.data.success && Array.isArray(res.data.bankAccounts)) {
          const current = res.data.bankAccounts.find(
            (a) => String(a._id) === String(id) || String(a.id) === String(id)
          );
          if (current) {
            setFormData({
              account_number: current.accountNumber || "",
              account_holder_name: current.accountHolder || "",
              bank_name: current.bankName || "",
              branch_name: current.branch || "",
              ifsc_code: current.ifscCode || "",
            });
          } else {
            showErrorAlert("Bank account not found");
          }
        }
      } catch (err) {
        console.error("Failed to load bank account:", err);
        showErrorAlert("Failed to load bank account details");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadAccount();
  }, [id]);

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
        branch: formData.branch_name ? formData.branch_name.trim() : "Main Branch",
        ifscCode: formData.ifsc_code.trim().toUpperCase(),
      };

      const res = await api.put(`/subadmin-auth/bank-accounts/${id}`, payload);
      if (res.data && res.data.success) {
        showSuccessAlert("Bank account updated successfully!");
        setTimeout(() => {
          navigate("/crm-bank-details");
        }, 1000);
      }
    } catch (err) {
      console.error("Failed to update bank account:", err);
      showErrorAlert(err.response?.data?.message || "Failed to update bank account");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="crm-bank-page-wrap" style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
        Loading bank account details...
      </div>
    );
  }

  return (
    <div className="crm-bank-page-wrap">
      {/* Header */}
      <div className="crm-bank-page-header d-flex align-items-center justify-content-between">
        <div>
          <h3 className="crm-bank-page-title">
            <Landmark className="crm-bank-header-icon" size={24} />
            Edit Bank Details
          </h3>
          <p className="crm-bank-page-subtitle">Update your bank account information</p>
        </div>

        <button
          type="button"
          className="crm-bank-back-btn"
          onClick={() => navigate("/crm-bank-details")}
        >
          <ArrowLeft size={16} /> Back to Bank Details
        </button>
      </div>

      {/* Edit Card Form */}
      <div className="crm-bank-card">
        <div className="crm-bank-card-header">
          <div className="crm-bank-card-icon">
            <CreditCard size={22} />
          </div>
          <div>
            <h4 className="crm-bank-card-title">Bank Account Information</h4>
            <p className="crm-bank-card-subtitle">Modify account details below</p>
          </div>
        </div>

        <div className="crm-bank-card-body">
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
                <span>{submitting ? "Updating..." : "Update Bank Details"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
