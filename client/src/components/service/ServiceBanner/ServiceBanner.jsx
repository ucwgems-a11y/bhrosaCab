import { useEffect, useState, Fragment } from "react";
import "./ServiceBanner.css";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";

// Default background, used when admin hasn't uploaded a custom one
import defaultBg from "../../../assets/img/bg-1.jpg";

const ServiceBanner = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/service-banner").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  const bgUrl = data.backgroundImage ? `${SERVER_URL}${data.backgroundImage}` : defaultBg;
  const headingLines = (data.heading || "").split("\n");
  const descriptionLines = (data.description || "").split("\n");

  return (
    <section
      className="about-page-header"
      style={{ backgroundImage: `url(${bgUrl})` }}
    >
      <div className="about-overlay"></div>

      <div className="about-container">
        <div className="about-page-info">
          <h4>{data.label}</h4>

          <h2>
            {headingLines.map((line, i) => {
              const isHighlighted = data.highlight && line.trim() === data.highlight.trim();
              return (
                <Fragment key={i}>
                  {isHighlighted ? <span>{line}</span> : line}
                  {i < headingLines.length - 1 && <br />}
                </Fragment>
              );
            })}
          </h2>

          <p>
            {descriptionLines.map((line, i) => (
              <Fragment key={i}>
                {line}
                {i < descriptionLines.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        </div>
      </div>

      <div className="about-page-shape"></div>
    </section>
  );
};

export default ServiceBanner;