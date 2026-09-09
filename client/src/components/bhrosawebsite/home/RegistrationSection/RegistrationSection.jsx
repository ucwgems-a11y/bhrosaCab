import { useEffect, useState } from "react";
import "./RegistrationSection.css";
import api from "../../../../api/axios";
import { SERVER_URL } from "../../../../config";

const RegistrationSection = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/registration-section").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <section className="registration-section">
      <div className="registration-container">
        <div className="registration-content">
          <h2>
            <span>{data.heading}</span>
          </h2>

          <p>{data.description}</p>
        </div>

        {data.image && (
          <div className="registration-image">
            <img src={`${SERVER_URL}${data.image}`} alt="Register" />
          </div>
        )}
      </div>
    </section>
  );
};

export default RegistrationSection;