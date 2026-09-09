import HeroContent from "./HeroContent";
import { SERVER_URL } from "../../../../config";

function HeroSlide({ slide }) {
  if (slide.type === "banner") {
    return (
      <div className="banner-slide">
        <img src={`${SERVER_URL}${slide.image}`} alt="" />
      </div>
    );
  }

  return (
    <div
      className="hero-slide"
      style={{ backgroundImage: `url(${SERVER_URL}${slide.bg})` }}
    >
      <div className="hero-overlay"></div>

      <div className="hero-container">
        <div className="hero-left">
          <HeroContent slide={slide} />
        </div>

        <div className="hero-right">
          <div className="shape">
            <div className="shape-left"></div>
            <div className="shape-center"></div>
            <div className="shape-right"></div>
          </div>

          <img src={`${SERVER_URL}${slide.car}`} alt="" className="car-img" />
        </div>
      </div>
    </div>
  );
}

export default HeroSlide;