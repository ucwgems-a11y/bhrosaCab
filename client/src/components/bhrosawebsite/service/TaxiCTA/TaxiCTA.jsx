import { useEffect, useState, Fragment } from "react";
import "./TaxiCTA.css";
import { FaArrowRight } from "react-icons/fa";
import api from "../../../../api/axios";

export default function TaxiCTA() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/taxi-cta").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  const headingLines = (data.heading || "").split("\n");

  return (
    <section className="taxi-cta">
      <div className="taxi-bg-cta"></div>

      <div className="taxi-container">
        {/* Left */}
        <div className="taxi-content">
          <h4>{data.label}</h4>

          <h2>
            {headingLines.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>

          <a href={data.buttonLink} className="taxi-btn">
            {data.buttonText}
          </a>
        </div>

        {/* Right */}
        <div className="taxi-list">
          {(data.items || []).map((item, index) => (
            <div className="taxi-item" key={index}>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}