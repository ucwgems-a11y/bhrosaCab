import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./offerSection.css";
import OfferCard from "./OfferCard";
import api from "../../../../api/axios";

function OfferSection() {
  const [heading, setHeading] = useState(null);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    api.get("/offer-heading").then((res) => setHeading(res.data));
    api.get("/offer-cards").then((res) => setCards(res.data));
  }, []);

  if (!heading || cards.length === 0) return null;

  return (
    <section className="service-section">
      <div className="bg-half"></div>

      <div className="service-container">
        <div className="service-heading" data-aos="fade-up">
          <h4>{heading.label}</h4>
          <h2>{heading.title}</h2>
          <p>{heading.description}</p>
        </div>

        <Swiper
          className="service-swiper"
          modules={[Navigation, Pagination, Autoplay]}
          slidesPerView={3}
          spaceBetween={30}
          loop={true}
          speed={900}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation={{ nextEl: ".offer-next", prevEl: ".offer-prev" }}
          pagination={{ clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
        >
          {cards.map((item) => (
            <SwiperSlide key={item._id}>
              <OfferCard item={item} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="offer-prev">←</div>
        <div className="offer-next">→</div>
      </div>
    </section>
  );
}

export default OfferSection;