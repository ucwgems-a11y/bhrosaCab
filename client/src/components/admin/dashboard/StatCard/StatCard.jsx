import "./StatCard.css";

export default function StatCard({ label, value, icon, editable }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-bottom">
        <div className="stat-card-value">
          {icon} {value}
        </div>
        {editable && <button className="stat-card-edit">✎</button>}
      </div>
    </div>
  );
}