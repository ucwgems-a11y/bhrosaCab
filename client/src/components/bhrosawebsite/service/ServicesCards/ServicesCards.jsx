import { useEffect, useState } from "react";
import "./ServicesCards.css";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";

export default function ServicesCards() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get("/service-cards").then((res) => setServices(res.data));
  }, []);

  if (services.length === 0) return null;

  return (
    <section className="services-cards">
      <div className="services-container">
        <div className="services-grid">
          {services.map((item) => (
            <div className="service-card" key={item._id}>
              <div className="service-thumb">
                <img src={`${SERVER_URL}${item.bg}`} alt="" className="service-bg" />

                <div className="service-scooter">
                  <img src={`${SERVER_URL}${item.icon}`} alt="" />
                </div>
              </div>

              <div className="service-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}