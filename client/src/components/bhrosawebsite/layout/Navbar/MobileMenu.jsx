import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa";

import logo from "../../../../assets/logo.png";
import navLinks from "./NavLinks";

import "./MobileMenu.css";

function MobileMenu({ open, close }) {
  return (
    <>
      <div
        className={`mobile-overlay ${open ? "show" : ""}`}
        onClick={close}
      ></div>

      <aside className={`mobile-menu ${open ? "active" : ""}`}>
        <div className="mobile-top">
          <img src={logo} alt="" />

          <FaTimes className="close-btn" onClick={close} />
        </div>

        <ul>
          {navLinks.map((item) => (
            <li key={item.path}>
              <Link to={item.path} onClick={close}>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}

export default MobileMenu;
