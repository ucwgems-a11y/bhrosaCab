import "./Header.css";

function ContactItem({ icon, title, value }) {
  return (
    <>
      <div className="header-info-icon">{icon}</div>

      <div className="header-info-text">
        <span>{title}</span>
        <h3>{value}</h3>
      </div>
    </>
  );
}

export default ContactItem;
