import { useEffect, useState, Fragment } from "react";
import "./AboutBanner.css";
import api from "../../../api/axios";

function AboutBanner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/about-banner").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  const headingLines = (data.heading || "").split("\n");
  const descriptionLines = (data.description || "").split("\n");

  return (
    <section className="about-page-header">
      <div className="about-page-shape"></div>

      <div className="about-container">
        <div className="about-page-info">
          <h4>{data.label}</h4>

          <h2>
            {headingLines.map((line, i) => {
              const parts = data.highlight ? line.split(data.highlight) : [line];

              return (
                <Fragment key={i}>
                  {parts[0]}
                  {parts.length > 1 && <span className="highlight-text">{data.highlight}</span>}
                  {parts[1]}
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
    </section>
  );
}

export default AboutBanner;