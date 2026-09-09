import { useEffect, useState } from "react";
import "./DownloadSection.css";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";

// Ye 3 images static hi rehti hain, sirf mobile aur marker dynamic hain
import taxiBg from "../../../../assets/img/taxi-background.png";
import taxi from "../../../../assets/img/taxi-one.png";
import character from "../../../../assets/img/charecter-one.png";

function DownloadSection() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/download-section").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <section className="download-section">
      <div className="download-container">
        <div className="download-wrapper">
          {/* LEFT */}
          <div className="download-content">
            <h4>{data.label}</h4>
            <h2>{data.title}</h2>
            <p>{data.description}</p>

            <ul className="app-feature">
              {(data.features || []).map((item, index) => (
                <li key={index}>
                  {item.icon && (
                    <img
                      src={`${SERVER_URL}${item.icon}`}
                      alt=""
                      className="feature-icon"
                    />
                  )}
                  <h3>
                    {item.title}
                    <br />
                    {item.subtitle}
                  </h3>
                </li>
              ))}
            </ul>

            <a href={data.downloadLink} target="_blank" rel="noreferrer" className="download-btn">
              Download Now
            </a>
          </div>

          {/* RIGHT */}
          <div className="download-image">
            <img src={taxiBg} alt="" className="taxi-bg" />

            {data.mobileImage && (
              <img
                src={`${SERVER_URL}${data.mobileImage}`}
                alt=""
                className="mobile-img"
              />
            )}

            <img src={taxi} alt="" className="taxi-img" />
            <img src={character} alt="" className="character-img" />

            {data.markerImage && (
              <img
                src={`${SERVER_URL}${data.markerImage}`}
                alt=""
                className="marker-img"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DownloadSection;