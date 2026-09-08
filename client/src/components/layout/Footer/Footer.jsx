import { useEffect, useState, Fragment } from "react";
import "./Footer.css";
import { FaPhoneVolume } from "react-icons/fa6";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";

import defaultLogo from "../../../assets/img/LogoWhite.png";

function Footer() {
  const [top, setTop] = useState(null);
  const [middle, setMiddle] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    api.get("/footer-top").then((res) => setTop(res.data));
    api.get("/footer-middle").then((res) => setMiddle(res.data));
    api.get("/company-info").then((res) => setCompanyInfo(res.data));
    api.get("/footer-vehicles").then((res) => setVehicles(res.data));
  }, []);

  if (!top || !middle || !companyInfo) return null;

  const logoUrl = top.logo ? `${SERVER_URL}${top.logo}` : defaultLogo;
  const addressLines = (companyInfo.address || "").split("\n");

  return (
    <footer className="footer-section">
      <div className="footer-top-wrap">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <img src={logoUrl} alt="Bhrosa Cab" />
              <p>{top.description}</p>
            </div>

            <div className="footer-call">
              <FaPhoneVolume className="call-icon" />
              <div>
                <span>Call For Taxi</span>
                <a href={`tel:${companyInfo.phone}`}>{companyInfo.phone}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-mid-wrap">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-item">
              <h3>Working Hours</h3>
              <ul>
                <li>
                  <span>Call Us</span>
                  <a href={`tel:${companyInfo.phone}`}>{companyInfo.phone}</a>
                </li>
              </ul>
            </div>

            <div className="footer-item">
              <h3>Useful Links</h3>
              <ul className="footer-links">
                {(middle.links || []).map((link, i) => (
                  <li key={i}>
                    <a href={link.url}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-item">
              <h3>Head Office</h3>
              <ul>
                <li>
                  <span>Location :</span>
                  {addressLines.map((line, i) => (
                    <Fragment key={i}>
                      {line}
                      {i < addressLines.length - 1 && <br />}
                    </Fragment>
                  ))}
                </li>
                <li>
                  <span>Join Us:</span>
                  {companyInfo.email}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="running-taxi">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className={`footer-vehicle ${vehicle.direction}`}
              style={{
                backgroundImage: `url(${SERVER_URL}${vehicle.image})`,
                width: `${vehicle.width}px`,
                animationDuration: `${vehicle.speed}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="copyright-wrap">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} Bhrosa Cab. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;