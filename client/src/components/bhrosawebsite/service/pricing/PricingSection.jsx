import { useEffect, useState } from "react";
import "./PricingSection.css";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";

export default function PricingSection() {
  const [heading, setHeading] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    api.get("/pricing-heading").then((res) => setHeading(res.data));
    api.get("/pricing-cards").then((res) => setCards(res.data));
  }, []);

  if (!heading || cards.length === 0) return null;

  return (
    <section className="pricing-section">
      <div className="pricing-container">
        <div className="pricing-heading">
          <h4>{heading.label}</h4>
          <h2>{heading.title}</h2>
          <p>{heading.description}</p>
        </div>

        <div className="pricing-grid">
          {cards.map((item) => (
            <div className="pricing-card" key={item._id}>
              <div className="pricing-image">
                {item.image && (
                  <img
                    src={`${SERVER_URL}${item.image}`}
                    alt={item.title}
                    className="pricing-img"
                  />
                )}
              </div>

              <div className="pricing-body">
                <h3>{item.title}</h3>

                <div className="price">
                  {item.price}
                  <span>/km</span>
                </div>

                <ul>
                  {(item.features || []).map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}