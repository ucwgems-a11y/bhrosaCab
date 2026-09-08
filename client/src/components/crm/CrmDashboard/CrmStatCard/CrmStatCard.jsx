import { Link } from "react-router-dom";
import "./CrmStatCard.css";

export default function CrmStatCard({ label, value, to }) {
  const content = (
    <div className="crm-stat-card-inner">
      <span className="crm-stat-card-label">{label}</span>
      <h2 className="crm-stat-card-value">{value}</h2>
    </div>
  );

  if (to) {
    return (
      <div className="crm-stat-card">
        <Link to={to} className="crm-stat-card-link">
          {content}
        </Link>
      </div>
    );
  }

  return <div className="crm-stat-card">{content}</div>;
}
