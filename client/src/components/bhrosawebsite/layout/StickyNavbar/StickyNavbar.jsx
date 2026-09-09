import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import navLinks from "../Navbar/NavLinks";
import logo from "../../../../assets/img/LogoBlack.png";
import "./StickyNavbar.css";

function StickyNavbar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 180);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`sticky-navbar ${show ? "show" : ""}`}>
      <div className="container">
        <div className="sticky-nav-inner">
          {/* Logo */}
          <div className="sticky-logo">
            <NavLink to="/">
              <img src={logo} alt="Logo" />
            </NavLink>
          </div>

          {/* Menu */}
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
        </div>
      </div>
    </nav>
  );
}

export default StickyNavbar;
