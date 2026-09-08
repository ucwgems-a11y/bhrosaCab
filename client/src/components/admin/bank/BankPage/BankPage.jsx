import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { confirmDelete } from "../../../../utils/sweetAlert";
import "../../shared/formCard.css";

// TODO: replace with GET /api/banks
const initialBanks = [
  { id: 1, name: "HDFC", icon: "https://ui-avatars.com/api/?name=HDFC&background=004c8f&color=fff" },
  { id: 2, name: "Bank of baroda", icon: "https://ui-avatars.com/api/?name=BOB&background=f26522&color=fff" },
  { id: 3, name: "SBI", icon: "https://ui-avatars.com/api/?name=SBI&background=280071&color=fff" },
  { id: 5, name: "ICICI Bank", icon: "https://ui-avatars.com/api/?name=ICICI&background=b82928&color=fff" },
  { id: 6, name: "IDBI Bank", icon: "https://ui-avatars.com/api/?name=IDBI&background=006738&color=fff" },
];

export default function BankPage() {
  const navigate = useNavigate();
  const [banks, setBanks] = useState(initialBanks);
  const [search, setSearch] = useState("");
  const [bankName, setBankName] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const filteredBanks = banks.filter((b) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.name || "").toLowerCase().includes(q) ||
      String(b.id).includes(q)
    );
  });

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!bankName.trim()) return;
    const newBank = {
      id: Date.now(),
      name: bankName.trim(),
      icon: previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(bankName)}&background=e8873a&color=fff`,
    };
    setBanks((prev) => [newBank, ...prev]);
    setBankName("");
    setImage(null);
    setPreviewUrl(null);
  }

  function handleEdit(id) {
    navigate(`/admin/bank/edit/${id}`);
  }

  function handleDelete(id) {
    confirmDelete({
      title: "Are you sure?",
      text: "You won't be able to revert this bank record!",
      deletedText: "Bank record has been deleted.",
      onConfirm: () => {
        setBanks((prev) => prev.filter((b) => b.id !== id));
      },
    });
  }

  return (
    <div className="fc-page-wrap">
      {/* Add Bank */}
      <div className="fc-card">
        <div className="fc-card-header">
          <h4 className="fc-card-title">Add Bank</h4>
        </div>
        <div className="fc-card-body">
          <form onSubmit={handleSubmit}>
            <div className="fc-form-group">
              <label>Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="fc-form-group">
              <label>Bank Icon</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {previewUrl && (
                <img src={previewUrl} alt="" className="fc-image-preview" />
              )}
            </div>
            <button type="submit" className="fc-submit-btn">
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Added Banks */}
      <div className="fc-card">
        <div className="fc-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
          <h4 className="fc-card-title">Added Bank's</h4>
          <input
            type="search"
            placeholder="Search bank..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-color, #334155)",
              background: "var(--bg-main, #0f172a)",
              color: "var(--text-main, #fff)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>
        <div className="fc-card-body">
          <div className="fc-table-wrap">
            <table className="fc-table">
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Bank Name</th>
                  <th>Bank Icon</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="fc-no-data">
                      No banks found
                    </td>
                  </tr>
                ) : (
                  filteredBanks.map((b, i) => (
                    <tr key={b.id}>
                      <td>{i + 1}</td>
                      <td>{b.name}</td>
                      <td>
                        <img src={b.icon} alt="" className="fc-table-icon" />
                      </td>
                      <td>
                        <div className="fc-action-icons">
                          <button
                            className="fc-icon-btn edit"
                            onClick={() => handleEdit(b.id)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="fc-icon-btn delete"
                            onClick={() => handleDelete(b.id)}
                          >
                            <Trash2 size={14} />
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