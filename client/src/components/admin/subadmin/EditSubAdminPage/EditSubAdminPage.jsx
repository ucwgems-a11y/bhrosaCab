import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { SERVER_URL, API_BASE_URL } from "../../../../config";
import { Country, State, City } from "country-state-city";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import "../../shared/formCard.css";
import "./EditSubAdminPage.css";

const mockSubAdmins = [
  {
    id: 19,
    name: "Amar Bhrosa",
    email: "amar@bhrosacab.com",
    phone: "+91 6280048453",
    countryCode: "+91",
    country: "101",
    state: "Punjab",
    city: "Mohali",
    address: "Bhrosa HQ, Mohali, Punjab",
    ip: "43.228.220.73",
    status: "Inactive",
    minimumMg: "50000.00",
    image: "https://bhrosacab-storage.s3.ap-south-1.amazonaws.com/userImage/6062d0da-60ff-4a2a-8f63-515ed32224e8.png",
  },
  {
    id: 15,
    name: "Gujrat",
    email: "founder@bhrosacab.com",
    phone: "+91 9876467670",
    countryCode: "+91",
    country: "101",
    state: "Gujarat",
    city: "Ahmedabad",
    address: "SG Highway, Ahmedabad, Gujarat",
    ip: "43.228.220.73",
    status: "Inactive",
    minimumMg: "",
    image: "https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=",
  },
  {
    id: 14,
    name: "Madhya Pradesh",
    email: "founder@bhrosacab.com",
    phone: "+91 9876467670",
    countryCode: "+91",
    country: "101",
    state: "Madhya Pradesh",
    city: "Bhopal",
    address: "MP Nagar, Bhopal, MP",
    ip: "43.228.220.73",
    status: "Inactive",
    minimumMg: "",
    image: "https://media.istockphoto.com/id/1451587807/vector/user-profile-icon-vector-avatar-or-person-icon-profile-picture-portrait-symbol-vector.jpg?s=612x612&w=0&k=20&c=yDJ4ITX1cHMh25Lt1vI1zBn2cAKKAlByHBvPJ8gEiIg=",
  },
  {
    id: 13,
    name: "Jharkhand",
    email: "bhrosahelpdesk@gmail.com",
    phone: "+91 9876467670",
    countryCode: "+91",
    country: "101",
    state: "Jharkhand",
    city: "Ranchi",
    address: "Main Road, Ranchi, Jharkhand",
    ip: "223.181.19.169",
    status: "Inactive",
    minimumMg: "",
    image: "https://bhrosacab.com/uploads/userImage/eace94ce-e3fd-48ac-a710-7665bf570d6e.png",
  },
  {
    id: 12,
    name: "Bihar",
    email: "director@bhrosacab.com",
    phone: "+91 7039000037",
    countryCode: "+91",
    country: "101",
    state: "Bihar",
    city: "Patna",
    address: "Boring Road, Patna, Bihar",
    ip: "223.181.19.169",
    status: "Inactive",
    minimumMg: "",
    image: "https://bhrosacab.com/uploads/userImage/f26c1bc0-751d-4275-bbe7-5039d9c1ab32.png",
  },
  {
    id: 11,
    name: "Maharashtra User",
    email: "founder@bhrosacab.com",
    phone: "+91 9876467670",
    countryCode: "+91",
    country: "101",
    state: "Maharashtra",
    city: "Mumbai",
    address: "Andheri East, Mumbai, Maharashtra",
    ip: "202.134.159.6",
    status: "Inactive",
    minimumMg: "",
    image: "https://bhrosacab.com/uploads/userImage/c1503f9d-1c73-444d-bd23-26a08a24c17f.png",
  },
];

export default function EditSubAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const record = mockSubAdmins.find((s) => s.id === Number(id)) || mockSubAdmins[0];

  const [fullName, setFullName] = useState(record ? record.name : "");
  const [email, setEmail] = useState(record ? record.email : "");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState(record ? record.countryCode : "+91");
  const [phone, setPhone] = useState(record ? record.phone : "");
  const [country, setCountry] = useState(record ? String(record.country) : "India");
  const [countryIso, setCountryIso] = useState(record?.country === "101" ? "IN" : "");
  const [state, setState] = useState(record ? record.state : "");
  const [stateIso, setStateIso] = useState("");
  const [city, setCity] = useState(record ? record.city : "");
  const [address, setAddress] = useState(record ? record.address : "");
  const [minimumMg, setMinimumMg] = useState(record ? record.minimumMg || "" : "");
  const [commission, setCommission] = useState(record ? record.commission || "" : "");
  const [agreement, setAgreement] = useState(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(record ? record.image : null);
  const [ipAddress, setIpAddress] = useState(record ? record.ip : "");
  const [submitting, setSubmitting] = useState(false);

  // States of currently selected Country
  const statesList = useMemo(() => {
    return countryIso ? State.getStatesOfCountry(countryIso) : [];
  }, [countryIso]);

  // Cities of currently selected State
  const citiesList = useMemo(() => {
    return countryIso && stateIso ? City.getCitiesOfState(countryIso, stateIso) : [];
  }, [countryIso, stateIso]);

  function resolveLocation(countryVal, stateVal, cityVal) {
    let cIso = "";
    let cName = "";
    if (countryVal) {
      const found = allCountries.find(
        (c) =>
          c.isoCode.toLowerCase() === String(countryVal).toLowerCase() ||
          c.name.toLowerCase() === String(countryVal).toLowerCase() ||
          (String(countryVal) === "101" && c.isoCode === "IN")
      );
      if (found) {
        cIso = found.isoCode;
        cName = found.name;
      } else {
        cName = countryVal;
      }
    }

    let sIso = "";
    let sName = "";
    if (cIso && stateVal) {
      const sList = State.getStatesOfCountry(cIso);
      const foundState = sList.find(
        (st) =>
          st.isoCode.toLowerCase() === String(stateVal).toLowerCase() ||
          st.name.toLowerCase() === String(stateVal).toLowerCase()
      );
      if (foundState) {
        sIso = foundState.isoCode;
        sName = foundState.name;
      } else {
        sName = stateVal;
      }
    }

    setCountryIso(cIso);
    setCountry(cName);
    setStateIso(sIso);
    setState(sName);
    setCity(cityVal || "");
  }

  useEffect(() => {
    async function fetchSubAdmin() {
      try {
        const res = await axios.get(`${API_BASE_URL}/subadmins/${id}`);
        if (res.data?.subAdmin) {
          const s = res.data.subAdmin;
          setFullName(s.name || "");
          setEmail(s.email || "");
          setCountryCode(s.countryCode || "+91");
          setPhone(s.phone || "");
          resolveLocation(s.country || "India", s.state || "", s.city || "");
          setAddress(s.address || "");
          setMinimumMg(s.minimumMG ? String(s.minimumMG) : "");
          setCommission(s.commission !== undefined ? String(s.commission) : "");
          setIpAddress(s.ipAddress || "");
          if (s.profileImage) {
            setPreviewUrl(
              s.profileImage.startsWith("http")
                ? s.profileImage
                : `${SERVER_URL}${s.profileImage.startsWith("/") ? "" : "/"}${s.profileImage}`
            );
          }
          return;
        }
      } catch (err) {
        console.log("Using local fallback record for edit:", err.message);
      }

      if (record) {
        setFullName(record.name);
        setEmail(record.email);
        setCountryCode(record.countryCode || "+91");
        setPhone(record.phone);
        resolveLocation(record.country || "India", record.state || "", record.city || "");
        setAddress(record.address || "");
        setMinimumMg(record.minimumMg || "");
        setCommission(record.commission || "");
        setIpAddress(record.ip || "");
        setPreviewUrl(record.image || null);
      }
    }
    fetchSubAdmin();
  }, [id, allCountries]);

  function handleCountryChange(e) {
    const selectedIso = e.target.value;
    setCountryIso(selectedIso);
    const found = Country.getCountryByCode(selectedIso);
    setCountry(found ? found.name : "");
    if (found?.phonecode) {
      const codeStr = "+" + found.phonecode.replace("+", "");
      setCountryCode(codeStr);
    }
    setState("");
    setStateIso("");
    setCity("");
  }

  function handleStateChange(e) {
    const selectedStateIso = e.target.value;
    setStateIso(selectedStateIso);
    const foundState = State.getStateByCodeAndCountry(selectedStateIso, countryIso);
    setState(foundState ? foundState.name : "");
    setCity("");
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", fullName);
      formData.append("email", email);
      if (password && password.trim()) {
        formData.append("password", password);
      }
      formData.append("phone", phone);
      formData.append("countryCode", countryCode);
      formData.append("country", country);
      formData.append("state", state);
      formData.append("city", city);
      formData.append("address", address);
      formData.append("minimumMG", minimumMg ? Number(minimumMg) : 0);
      formData.append("commission", commission ? Number(commission) : 0);
      formData.append("ipAddress", ipAddress);
      if (image) {
        formData.append("image", image);
      }
      if (agreement) {
        formData.append("agreement", agreement);
      }

      await axios.put(`${API_BASE_URL}/subadmins/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.log("Subadmin update note:", err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
      showSuccessAlert("Your work has been saved", 1000);
      setTimeout(() => {
        navigate("/admin/subadmin/see");
      }, 1000);
    }
  }

  return (
    <div className="fc-page-wrap">
      <div style={{ marginBottom: "16px", maxWidth: "960px", margin: "0 auto 16px auto" }}>
        <button
          className="fc-back-btn"
          onClick={() => navigate("/admin/subadmin/see")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "var(--card-bg, #1a222d)",
            color: "var(--text-main, #fff)",
            border: "1px solid var(--border-color, #2a3441)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "13px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Sub-Admins List</span>
        </button>
      </div>

      <div className="subadmin-form-panel">
        <form onSubmit={handleSubmit} className="user-form">
          <div className="subadmin-form-grid">
            {/* Column 1 */}
            <div className="subadmin-form-col">
              <div className="fc-form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="fc-form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="fc-form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="fc-form-group">
                <label htmlFor="country_code">Country Code *</label>
                <select
                  id="country_code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  required
                >
                  <option value="+1">+1 (USA)</option>
                  <option value="+91">+91 (India)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (UAE)</option>
                </select>
              </div>
            </div>

            {/* Column 2 */}
            <div className="subadmin-form-col">
              <div className="fc-form-group">
                <label htmlFor="number">Phone Number *</label>
                <input
                  type="text"
                  id="number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="fc-form-group">
                <label htmlFor="country">Country *</label>
                <select
                  id="country"
                  value={countryIso}
                  onChange={handleCountryChange}
                  required
                >
                  <option value="">Select Country</option>
                  {allCountries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fc-form-group">
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  value={stateIso}
                  onChange={handleStateChange}
                  disabled={!countryIso}
                  required
                >
                  <option value="">
                    {countryIso ? "Select State" : "Select Country First"}
                  </option>
                  {statesList.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="fc-form-group">
                <label htmlFor="city">City *</label>
                {citiesList.length > 0 ? (
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!stateIso}
                    required
                  >
                    <option value="">
                      {!stateIso ? "Select State First" : "Select City"}
                    </option>
                    {citiesList.map((ct, idx) => (
                      <option key={`${ct.name}-${idx}`} value={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="city"
                    placeholder={stateIso ? "Enter City" : "Select State First"}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!stateIso}
                    required
                  />
                )}
              </div>
            </div>
          </div>

          <div className="fc-form-group subadmin-full-width">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="subadmin-form-grid">
            <div className="fc-form-group">
              <label htmlFor="minimum_mg">Minimum MG</label>
              <input
                type="text"
                id="minimum_mg"
                value={minimumMg}
                onChange={(e) => setMinimumMg(e.target.value)}
              />
            </div>

            <div className="fc-form-group">
              <label htmlFor="agreement">Agreement</label>
              <input
                type="file"
                id="agreement"
                accept="application/pdf"
                onChange={(e) => setAgreement(e.target.files[0])}
              />
            </div>
          </div>

          <div className="subadmin-form-grid">
            <div className="fc-form-group">
              <label htmlFor="image">Profile Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              {previewUrl && (
                <img src={previewUrl} alt="" className="fc-image-preview" />
              )}
            </div>

            <div className="fc-form-group">
              <label htmlFor="ip_address">IP</label>
              <input
                type="text"
                id="ip_address"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Enter IP (e.g. 49.43.110.253)"
              />
            </div>
          </div>

          <div className="fc-form-group subadmin-full-width">
            <label htmlFor="commission">Commission*</label>
            <input
              type="number"
              id="commission"
              name="commission"
              min="0"
              max="25"
              step="0.01"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="Enter Commission (0 - 25)"
              required
            />
          </div>

          <button
            type="submit"
            className="fc-submit-btn subadmin-submit-btn"
            disabled={submitting}
          >
            {submitting ? "UPDATING..." : "UPDATE SUB ADMIN"}
          </button>
        </form>
      </div>
    </div>
  );
}

