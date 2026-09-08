import { useEffect, useState } from "react";
import "./FranchiseBanner.css";
import api from "../../../api/axios";

function FranchiseBanner() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/franchise-banner").then((res) => setData(res.data));
  }, []);

  if (!data) return null;

  return (
    <section className="franchise-page-header">
      <div className="franchise-container">
        <div className="franchise-page-info">
          <h4>{data.label}</h4>
          <h2>{data.heading}</h2>
        </div>
      </div>

      <div className="franchise-page-shape"></div>
    </section>
  );
}

export default FranchiseBanner;