import { useEffect, useState } from "react";
import "./FranchiseBenefits.css";
import api from "../../../api/axios";
import { SERVER_URL } from "../../../config";

function FranchiseBenefits() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/franchise-benefits").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <section className="franchise-benefits">
      <div className="franchise-container">
        <div className="franchise-wrapper">
          {/* Left Image */}
          <div className="franchise-left">
            <div className="franchise-image">
              {data.image && <img src={`${SERVER_URL}${data.image}`} alt="Office" />}
            </div>
          </div>

          {/* Right Content */}
          <div className="franchise-right">
            <div className="franchise-heading">
              <h2>{data.heading}</h2>
              <h4>{data.subheading}</h4>

              <ul>
                {(data.benefits || []).map((benefit, index) => (
                  <li key={index}>
                    {index + 1}. {benefit.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FranchiseBenefits;