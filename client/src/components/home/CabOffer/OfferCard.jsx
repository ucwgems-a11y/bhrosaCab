import { SERVER_URL } from "../../../config";

function OfferCard({ item }) {
  return (
    <div className="service-item">
      <div className="service-thumb">
        <img src={`${SERVER_URL}${item.bg}`} alt={item.title} className="service-bg" />

        <div className="service-shape-wrap">
          <div className="service-shape"></div>
        </div>

        <div className="service-car">
          <img src={`${SERVER_URL}${item.vehicle}`} alt={item.title} />
        </div>
      </div>

      <div className="service-content">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </div>
  );
}

export default OfferCard;