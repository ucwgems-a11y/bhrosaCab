import { useEffect, useState } from "react";
import "./OnlineBooking.css";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";

function OnlineBooking() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/online-booking").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <section className="booking-section">
      <div className="booking-bg"></div>

      <div className="booking-container">
        <div className="booking-wrapper">
          <div className="booking-left">
            {data.carImage && (
              <img
                src={`${SERVER_URL}${data.carImage}`}
                alt="Booking Car"
                className="booking-car"
              />
            )}
          </div>

          <div className="booking-right">
            <h4>{data.label}</h4>
            <h2>{data.title}</h2>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OnlineBooking;