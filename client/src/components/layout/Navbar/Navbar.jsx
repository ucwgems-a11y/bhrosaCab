import { NavLink } from "react-router-dom";
import navLinks from "./NavLinks";
import "./navbar.css";

function Navbar() {
  return (
    <nav className="nav-menu-wrapper">
      <div className="container">
        <div className="nav-menu-inner">
          <ul className="menu">
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

export default Navbar;
