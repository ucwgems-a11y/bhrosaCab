import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import api from "../../../../api/axios";
import HeroSlide from "./HeroSlide";

function HeroSlider() {
  const [heroData, setHeroData] = useState([]);

  useEffect(() => {
    api.get("/hero-slides").then((res) => setHeroData(res.data));
  }, []);

  if (heroData.length === 0) return null;

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      slidesPerView={1}
      loop={true}
      speed={1000}
      navigation={{
        nextEl: ".slider-button-next",
        prevEl: ".slider-button-prev",
      }}
      pagination={{
        el: ".slider-pagination",
        type: "fraction",
      }}
      className="heroSwiper"
      onSlideChangeTransitionStart={(swiper) => {
        const slides = swiper.slides;
        slides.forEach((slide) => slide.classList.remove("animate-slide"));
        swiper.slides[swiper.activeIndex].classList.add("animate-slide");
      }}
      onSwiper={(swiper) => {
        swiper.slides[swiper.activeIndex].classList.add("animate-slide");
      }}
    >
      {heroData.map((item) => (
        <SwiperSlide key={item._id}>
          <HeroSlide slide={item} />
        </SwiperSlide>
      ))}

      <div className="slider-controls">
        <div className="slider-control slider-button-prev">← Prev</div>
        <div className="slider-pagination"></div>
        <div className="slider-control slider-button-next">Next →</div>
      </div>
    </Swiper>
  );
}

export default HeroSlider;