import "./CrmFareCard.css";

export default function CrmFareCard({ icon, label, priceText }) {
  return (
    <div className="crm-fare-card">
      <div className="crm-fare-card-inner">
        <span className="crm-fare-card-header">Fare per km (₹)</span>
        <div className="crm-fare-card-body">
          <span className="crm-fare-card-icon">{icon}</span>
          <h3 className="crm-fare-card-title">
            {label} - {priceText}
          </h3>
        </div>
      </div>
    </div>
  );
}
