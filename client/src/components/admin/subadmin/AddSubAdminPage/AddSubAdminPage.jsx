import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "../../../../config";
import { Country, State, City } from "country-state-city";
import { showSuccessAlert } from "../../../../utils/sweetAlert";
import "../../shared/formCard.css";
import "./AddSubAdminPage.css";

export default function AddSubAdminPage() {
  const navigate = useNavigate();
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [countryIso, setCountryIso] = useState("");
  const [state, setState] = useState("");
  const [stateIso, setStateIso] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [minimumMg, setMinimumMg] = useState("");
  const [commission, setCommission] = useState("");
  const [agreement, setAgreement] = useState(null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // States of currently selected Country
  const statesList = useMemo(() => {
    return countryIso ? State.getStatesOfCountry(countryIso) : [];
  }, [countryIso]);

  // Cities of currently selected State
  const citiesList = useMemo(() => {
    return countryIso && stateIso ? City.getCitiesOfState(countryIso, stateIso) : [];
  }, [countryIso, stateIso]);

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
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("countryCode", countryCode);
      formData.append("country", country);
      formData.append("state", state);
      formData.append("city", city);
      formData.append("address", address);
      formData.append("minimumMG", minimumMg ? Number(minimumMg) : 0);
      formData.append("commission", commission ? Number(commission) : 0);
      formData.append("ipAddress", ipAddress);
      formData.append("ipStatus", true);
      if (image) {
        formData.append("image", image);
      }
      if (agreement) {
        formData.append("agreement", agreement);
      }

      await axios.post(`${API_BASE_URL}/subadmin-auth/register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.log("Subadmin registration note:", err.response?.data?.message || err.message);
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
      <div style={{ marginBottom: "16px", maxWidth: "100%", margin: "0 auto 16px auto" }}>
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
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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
                {submitting ? "CREATING..." : "CREATE USER"}
              </button>
            </form>
          </div>
        </div>
  );
}