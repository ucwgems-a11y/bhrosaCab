import { useEffect, useState } from "react";
import "./WhyChoose.css";
import whyChooseData from "./whyChooseData";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";

function WhyChoose() {
  const [leftData, setLeftData] = useState(null);

  useEffect(() => {
    api.get("/why-choose-left").then((res) => setLeftData(res.data));
  }, []);

  if (!leftData) return null;

  const headingLines = (leftData.heading || "").split("\n");

  return (
    <section className="why-section">
      <div className="why-container">
        <div className="why-wrapper">
          {/* LEFT — dynamic */}
          <div
            className="why-left"
            style={
              leftData.backgroundImage
                ? { backgroundImage: `url(${SERVER_URL}${leftData.backgroundImage})` }
                : {}
            }
          >
            <div className="section-heading">
              <h4>{leftData.label}</h4>

              <h2>
                {headingLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < headingLines.length - 1 && <br />}
                  </span>
                ))}
              </h2>

              <p>{leftData.description}</p>

              <div className="mt-3">
                
                  <a href={leftData.buttonLink} target="_blank" rel="noreferrer" className="why-btn">
                  {leftData.buttonText}
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — static, unchanged */}
          <div className="why-right">
            <div className="why-heading">
              <h4>WHY CHOOSE US!</h4>
              <h2>
                Why Ride with Bhrosa
                <br />
                Cab?
              </h2>
              <p>
                For reliable, comfortable, and affordable transportation,
                anytime, anywhere.
              </p>
            </div>

            <div className="why-list">
              {whyChooseData.map((item) => (
                <div className="why-item" key={item.id}>
                  <div className="why-icon">
                    <i className={item.icon}></i>
                  </div>

                  <div className="why-content">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChoose;