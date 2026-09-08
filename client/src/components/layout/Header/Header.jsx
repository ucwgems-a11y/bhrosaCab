import { useEffect, useState, Fragment } from "react";
import { FaBars } from "react-icons/fa";
import { FaPhoneAlt, FaEnvelopeOpen, FaMapMarkedAlt } from "react-icons/fa";
import ContactItem from "./ContactItem";
import MobileMenu from "../Navbar/MobileMenu";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";

import defaultLogo from "../../../assets/logo.png";
import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoData, setLogoData] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);

  useEffect(() => {
    api.get("/site-header").then((res) => setLogoData(res.data));
    api.get("/company-info").then((res) => setCompanyInfo(res.data));
  }, []);

  const logoUrl = logoData?.logo ? `${SERVER_URL}${logoData.logo}` : defaultLogo;
  const addressLines = (companyInfo?.address || "").split("\n");

  return (
    <>
      <header className="mid-header">
        <div className="header-container">
          <div className="mid-header-wrap">
            <div className="site-logo">
              <img src={logoUrl} alt="" />
            </div>

            <div className="header-info">
              <ul>
                <li>
                  <ContactItem icon={<FaPhoneAlt />} title="Call Us:" value={companyInfo?.phone} />
                </li>
                <li>
                  <ContactItem icon={<FaEnvelopeOpen />} title="Email Now:" value={companyInfo?.email} />
                </li>
                <li>
                  <ContactItem
                    icon={<FaMapMarkedAlt />}
                    title="Address:"
                    value={
                      <>
                        {addressLines.map((line, i) => (
                          <Fragment key={i}>
                            {line}
                            {i < addressLines.length - 1 && <br />}
                          </Fragment>
                        ))}
                      </>
                    }
                  />
                </li>
              </ul>
            </div>

            <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)}>
              <FaBars />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} />
    </>
  );
}

export default Header;