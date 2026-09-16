import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import navLinks from "../Navbar/NavLinks";
import MobileMenu from "../Navbar/MobileMenu";
import defaultLogo from "../../../../assets/img/LogoBlack.png";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";
import "./StickyNavbar.css";

function StickyNavbar() {
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(defaultLogo);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 180);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    api
      .get("/site-header")
      .then((res) => {
        if (res.data?.logo) {
          setLogoUrl(`${SERVER_URL}${res.data.logo}`);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <nav className={`sticky-navbar ${show ? "show" : ""}`}>
        <div className="container">
          <div className="sticky-nav-inner">
            {/* Logo */}
            <div className="sticky-logo">
              <NavLink to="/">
                <img src={logoUrl} alt="Bhrosa Cab" />
              </NavLink>
            </div>

            {/* Desktop Menu */}
            <ul className="sticky-menu">
              {navLinks.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => (isActive ? "active-link" : "")}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="sticky-mobile-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Toggle navigation"
            >
              <FaBars />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu open={menuOpen} close={() => setMenuOpen(false)} />
    </>
  );
}

export default StickyNavbar;
