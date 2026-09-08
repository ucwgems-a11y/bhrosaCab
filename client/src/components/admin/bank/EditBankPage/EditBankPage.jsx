import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Landmark, Upload, CheckCircle2 } from "lucide-react";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import "../../shared/formCard.css";
import "./EditBankPage.css";

const mockBanks = [
  { id: 1, name: "HDFC", icon: "https://ui-avatars.com/api/?name=HDFC&background=004c8f&color=fff" },
  { id: 2, name: "Bank of baroda", icon: "https://ui-avatars.com/api/?name=BOB&background=f26522&color=fff" },
  { id: 3, name: "SBI", icon: "https://ui-avatars.com/api/?name=SBI&background=280071&color=fff" },
  { id: 5, name: "ICICI Bank", icon: "https://ui-avatars.com/api/?name=ICICI&background=b82928&color=fff" },
  { id: 6, name: "IDBI Bank", icon: "https://ui-avatars.com/api/?name=IDBI&background=006738&color=fff" },
];

export default function EditBankPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bankRecord = mockBanks.find((b) => b.id === Number(id)) || {
    id: Number(id),
    name: "Bank",
    icon: "https://ui-avatars.com/api/?name=Bank",
  };

  const [bankName, setBankName] = useState(bankRecord ? bankRecord.name : "");
  const [previewUrl, setPreviewUrl] = useState(bankRecord ? bankRecord.icon : "");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (bankRecord) {
      setBankName(bankRecord.name);
      setPreviewUrl(bankRecord.icon);
    }
  }, [id]);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setShowSuccess(true);
      showSuccessAlert("Your work has been saved", 1000);
      setTimeout(() => {
        navigate("/admin/bank/add");
      }, 1000);
    }, 300);
  }

  function handleCancel() {
    navigate("/admin/bank/add");
  }

  return (
    <div className="fc-page-wrap">
      <div className="edit-bank-topbar">
        <button className="fc-back-btn" onClick={handleCancel}>
          <ArrowLeft size={16} />
          <span>Back to Bank's List</span>
        </button>
      </div>

      {showSuccess && (
        <div className="edit-bank-alert-success">
          <CheckCircle2 size={18} />
          <span>Bank details for <strong>{bankName}</strong> updated successfully!</span>
        </div>
      )}

      <div className="fc-card" style={{ maxWidth: 650 }}>
        <div className="fc-card-header">
          <div className="edit-bank-header-title">
            <Landmark size={20} className="edit-bank-icon" />
            <div>
              <h4 className="fc-card-title">Edit Bank</h4>
              <p className="edit-bank-subtitle">Update Bank #{id} details &amp; logo</p>
            </div>
          </div>
        </div>

        <div className="fc-card-body">
          <form onSubmit={handleSubmit}>
            <div className="fc-form-group">
              <label>Bank Name <span className="edit-bank-req">*</span></label>
              <input
                type="text"
                placeholder="e.g. HDFC Bank, SBI"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>

            <div className="fc-form-group">
              <label>Bank Icon / Logo</label>
              <div className="edit-bank-image-row">
                {previewUrl && (
                  <div className="edit-bank-preview-box">
                    <img src={previewUrl} alt="Bank Icon Preview" />
                  </div>
                )}
                <label className="edit-bank-upload-btn">
                  <Upload size={16} />
                  <span>Choose New Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            </div>

            <div className="edit-bank-actions">
              <button type="submit" className="fc-submit-btn" disabled={submitting}>
                {submitting ? "Updating..." : "Update Bank"}
              </button>
              <button type="button" className="edit-bank-cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

