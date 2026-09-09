import { useEffect, useState, Fragment } from "react";
import "./AboutCompany.css";
import { FaPlay } from "react-icons/fa";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";
import { a } from "framer-motion/client";

function AboutCompany() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/about-company").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  const headingLines = (data.heading || "").split("\n");

  return (
    <section className="about-company-section">
      <div className="about-company-container">
        {/* Left */}
        <div className="about-company-content">
          <h4>{data.label}</h4>

          <h2>
            {headingLines.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>

          {data.paragraph1 && <p>{data.paragraph1}</p>}
          {data.paragraph2 && <p>{data.paragraph2}</p>}
        </div>

        {/* Right */}
        <div className="about-company-image">
          {data.backImage && (
            <img src={`${SERVER_URL}${data.backImage}`} alt="Driver" className="about-img-back" />
          )}

          <div className="about-video-box">
            {data.frontImage && (
              <img src={`${SERVER_URL}${data.frontImage}`} alt="Taxi" className="about-img-front" />
            )}

            {data.videoLink && (
              
               <a href={data.videoLink}
                target="_blank"
                rel="noreferrer"
                className="play-btn"
              >
                <FaPlay />
                <span className="ripple"></span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutCompany;