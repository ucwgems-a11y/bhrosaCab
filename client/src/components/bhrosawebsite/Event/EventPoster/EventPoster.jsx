import { useEffect, useState } from "react";
import "./EventPoster.css";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";

function EventPoster() {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    api.get("/event-guests").then((res) => setGuests(res.data));
  }, []);

  if (guests.length === 0) return null;

  return (
    <section className="event-poster-section">
      <div className="event-container">
        <div className="event-grid">
          {guests.map((item) => (
            <div className="event-card" key={item._id}>
              <div className="event-image">
                {item.image && <img src={`${SERVER_URL}${item.image}`} alt={item.name} />}
              </div>

              <div className="event-content">
                <h3>
                  <a href="/">{item.name}</a>
                </h3>
                <h4>{item.role}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventPoster;