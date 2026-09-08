import React from "react";
import "./Hero.css";

function HeroContent({ slide }) {
  const titleLines = (slide.title || "").split("\n");

  return (
    <div className="slider-content-wrap">
      <div className="slider-content">
        <div className="slider-caption medium">
          <p>{slide.subtitle}</p>
        </div>

        <div className="slider-caption big">
          <h1>
            {titleLines.map((line, i) => (
              <React.Fragment key={i}>
                {slide.highlight && line.trim() === slide.highlight.trim() ? (
                  <span>{line}</span>
                ) : (
                  line
                )}
                {i < titleLines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
        </div>

        <div className="slider-caption small">
          <p data-aos="fade-up" data-aos-delay="200">
            {slide.description}
          </p>
        </div>

        <div className="slider-btn">
          <button className="default-btn">{slide.button}</button>
        </div>
      </div>
    </div>
  );
}

export default HeroContent;