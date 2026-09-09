import { useEffect, useState } from "react";
import "./ContactMap.css";
import api from "../../../../api/axios";

function ContactMap() {
  const [mapUrl, setMapUrl] = useState("");

  useEffect(() => {
    api.get("/contact-map").then((res) => {
      if (res.data) setMapUrl(res.data.mapEmbedUrl);
    });
  }, []);

  if (!mapUrl) return null;

  return (
    <section className="contact-map-section">
      <div className="contact-map-wrapper">
        <iframe
          title="Bhrosa Cab Location"
          src={mapUrl}
          loading="lazy"
          allowFullScreen
        ></iframe>
      </div>
    </section>
  );
}

export default ContactMap;