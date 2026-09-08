import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Landmark, CreditCard, User, MapPin, Code, Save, ArrowLeft } from "lucide-react";
import { swalWithBootstrapButtons } from "../../../utils/sweetAlert";
import "./CrmBankDetails.css";

export default function CrmEditBankDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem("crm_bank_accounts");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            accountNumber: "123456789",
            accountHolder: "aaaaa",
            bankName: "PNB BANK",
            branch: "dfasdf",
            ifscCode: "DFSD435435",
          },
        ];
  });

  const [formData, setFormData] = useState({
    account_number: "",
    account_holder_name: "",
    bank_name: "",
    branch_name: "",
    ifsc_code: "",
  });

  useEffect(() => {
    const current = bankAccounts.find((a) => String(a.id) === String(id));
    if (current) {
      setFormData({
        account_number: current.accountNumber || "",
        account_holder_name: current.accountHolder || "",
        bank_name: current.bankName || "",
        branch_name: current.branch || "",
        ifsc_code: current.ifscCode || "",
      });
    }
  }, [id, bankAccounts]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ifsc_code" ? value.toUpperCase() : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const updatedList = bankAccounts.map((acc) => {
      if (String(acc.id) === String(id)) {
        return {
          ...acc,
          accountNumber: formData.account_number,
          accountHolder: formData.account_holder_name,
          bankName: formData.bank_name,
          branch: formData.branch_name,
          ifscCode: formData.ifsc_code,
        };
      }
      return acc;
    });

    localStorage.setItem("crm_bank_accounts", JSON.stringify(updatedList));

    swalWithBootstrapButtons
      .fire({
        title: "Updated Successfully!",
        text: "Bank account details have been updated.",
        icon: "success",
      })
      .then(() => {
        navigate("/crm-bank-details");
      });
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
          <ArrowLeft size={16} />
          <span>Back to Bank Details</span>
        </button>
      </div>

      {/* Edit Card */}
      <div className="crm-bank-card">
        <div className="crm-bank-card-header">
          <div className="crm-bank-card-icon">
            <Landmark size={22} />
          </div>
          <div>
            <h4 className="crm-bank-card-title">Update Bank Account</h4>
            <p className="crm-bank-card-subtitle">Edit the fields below and click save</p>
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

            <div className="crm-bank-submit-area d-flex gap-3">
              <button type="submit" className="crm-bank-submit-btn">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
              <button
                type="button"
                className="crm-bank-cancel-btn"
                onClick={() => navigate("/crm-bank-details")}
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
