import { useEffect, useState } from "react";
import "./CtaSection.css";
import { FaArrowRight } from "react-icons/fa6";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";

import mapBg from "../../../../assets/img/map.png"; // static background, unchanged

function CtaSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/cta-section").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <section className="cta-section">
      <div className="cta-bg" style={{ backgroundImage: `url(${mapBg})` }}></div>

      <div className="cta-container">
        {/* Left */}
        <div className="cta-content">
          <h4>{data.label}</h4>
          <h2>{data.heading}</h2>
          <a href={data.buttonLink} className="cta-btn">
            {data.buttonText}
          </a>
        </div>

        {/* Middle */}
        <div className="cta-list">
          {(data.items || []).map((item, index) => (
            <div className="cta-item" key={index}>
              <span>
                <FaArrowRight />
              </span>
              {item.text}
            </div>
          ))}
        </div>

        {/* Right */}
        {data.image && (
          <div className="cta-man">
            <img src={`${SERVER_URL}${data.image}`} alt="Bhrosa Cab" />
          </div>
        )}
      </div>
    </section>
  );
}

export default CtaSection;