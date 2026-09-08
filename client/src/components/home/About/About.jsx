import { useEffect, useState } from "react";
import "./About.css";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";

function About() {
  const [about, setAbout] = useState(null);

  useEffect(() => {
    api.get("/about-section").then((res) => setAbout(res.data));
  }, []);

  if (!about) return null;

  return (
    <section className="about-section">
      <div className="container">
        <div className="about-wrapper">
          <div className="about-img">
            {about.image1 && (
              <img
                src={`${SERVER_URL}${about.image1}`}
                alt=""
                className="about-img1"
                data-aos="fade-down"
                data-aos-delay="200"
              />
            )}
            {about.image2 && (
              <img
                src={`${SERVER_URL}${about.image2}`}
                alt=""
                className="about-img2"
                data-aos="fade-up"
                data-aos-delay="100"
              />
            )}
          </div>

          <div className="about-content" data-aos="fade-right" data-aos-delay="200">
            <h4>{about.label}</h4>
            <h2>{about.heading}</h2>
            {about.paragraph1 && <p>{about.paragraph1}</p>}
            {about.paragraph2 && <p>{about.paragraph2}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;