import "./FareCard.css";

// A single "Fare per km" card — used for every vehicle type (Bike, Auto, Sedan, etc.)
export default function FareCard({ icon, label, price }) {
  const numPrice =
    typeof price === "number"
      ? price
      : parseFloat(String(price || "0").replace(/[^0-9.]/g, ""));

  return (
    <div className="fare-card">
      <div className="fare-card-label">Fare per km (₹)</div>
      <div className="fare-card-value">
        {icon} {label} - {isNaN(numPrice) ? "0.00" : numPrice.toFixed(2)} ₹
      </div>
    </div>
  );
}