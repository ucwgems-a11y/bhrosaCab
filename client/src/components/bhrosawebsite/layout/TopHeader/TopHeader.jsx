import "./TopHeader.css";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

function TopHeader() {
  return (
    <div className="top-header">
      <div className="container">
        <p>Bhrosa Group</p>

        <div className="social-icons">
          <a
            href="https://www.facebook.com/bhrosacab/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>

          <a
            href="https://x.com/?mx=2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>

          <a
            href="https://www.instagram.com/bhrosacab/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </div>
      </div>
    </div>
  );
}

export default TopHeader;
